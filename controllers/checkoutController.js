const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require('../models/userModel');
const Order = require('../models/orderModel');
//load checkout Page

const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const checkoutLoad= async(req,res)=>{
    try{
      const userId = req.session.user_id;
      const userData = await User.findById({ _id: userId });
      const address = userData.address;
      const total_after_discount=req.session.total_after_discount
      const cartData = await Cart.findOne({ user_id: userId }).populate('product.item');
      if (cartData.product.length > 0) {
        return res.render('checkout', { userData, address, cartData, total_after_discount});
      } else {
        return res.redirect('/cart/add-product');
      }
        
        
    }
    catch(error){
        console.log(error.message)
        return res.status(500).send('Internal Server Error');
    }
}
const addressLoad= async(req,res)=>{
  try{
    
      
      return res.render('address')
  }
  catch(error){
      console.log(error.message)
  }
}
const createAddress = async (req, res) => {
  try {
    const { firstname,lastname,email,mobile,address1,address2,zipcode,country , state, city } = req.body;
    const userId = req.session.user_id;
    const nameRegex = /^[A-Za-z\s\-']+$/;
        if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
            return res.status(400).json({ error: "Invalid name format." });
        }
        if (!firstname || !lastname || !email || !mobile || !address1 || !zipcode || !country || !state || !city) {
          return res.status(400).json({ error: "All fields are required." });
      }
      if (!firstname.trim() || !lastname.trim() || !email.trim() || !mobile.trim() ||
      !address1.trim() || !zipcode.trim() || !country.trim() || !state.trim() || !city.trim()) {
      return res.status(400).json({ error: "All fields are required." });
  }

    const newAddress = {
      firstname: firstname,
      lastname: lastname,
      email:email,
      mobile:mobile,
      zipcode: zipcode,
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      country:country,
    };
    
    const userData = await User.findById(userId);
    
    userData.address.push(newAddress);
    console.log("Updated userData.address:", userData.address);
    await userData.save();
    
    const address = userData.address;
    const total_after_discount=req.session.total_after_discount
    const cartData = await Cart.findOne({ user_id: userId }).populate('product.item');
    if (cartData.product.length > 0) {
      return res.render('checkout', { userData, address, cartData ,total_after_discount});
    } else {
      return res.redirect('/cart/add-product');
    }
   
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};
const saveAddress=(req,res)=>{
  
  req.session.userAddress =req.query.address
  res.json({message:'address saved'})
  
}

const saveTotalDiscount=async(req,res)=>{
  const Id = req.session.user_id;
  req.session.total_after_discount =req.query.total_discount
  const data=await User.findByIdAndUpdate({_id:Id},{$set:{cashback:req.query.disc}})
  await data.save()
  res.json({message:'address saved'})

}
const payment=async (req,res)=>{

  try {
    const method = req.query.method;
    const address = req.session.userAddress;
    const userId = req.session.user_id;
    
    // Prefix for the order ID
    const ORDER_ID_PREFIX = "ORD";

    // Function to generate a unique order ID
    function generateOrderId() {
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      const orderId = `${ORDER_ID_PREFIX}-${timestamp}-${randomNum}`;
      return orderId;
    }

    const cartData = await Cart.findOne({ user_id: userId }).populate('product.item');
    const totalAmountToUse = req.session.total_after_discount !== undefined ? req.session.total_after_discount : cartData.total_amount;
    const orderId = generateOrderId();

    const newOrder = new Order({
      user: cartData.user_id,
      orderId: orderId,
      items: cartData.product,
      shippingAddress: address,
      paymentMethod: method,
      total_amount: totalAmountToUse ,
      productPrice:cartData.pdtprice,
      flag:"paid"
    });

    await newOrder.save();

    for (const product of cartData.product) {
      const newPrdctQty = product.item.stock - product.quantity;
      await Product.findByIdAndUpdate({ _id: product.item._id }, { stock: newPrdctQty });
    }

    await Cart.findOneAndDelete({ _id: cartData._id });
    req.session.userAddress = null;
    if(req.session.total_after_discount!==undefined){
      req.session.total_after_discount = null;
    }
    

    return res.render('checkout-complete', { new_order: newOrder, cartData, address });
  } catch (err) {
    return res.send('error' + err);
  }
};
const createOrder = async (req, res) => {
  try {
    
    const address = req.session.userAddress;
    const userId = req.session.user_id;
    const method = req.query.method;

    // Prefix for the order ID
    const ORDER_ID_PREFIX = "ORD";

    // Function to generate a unique order ID
    function generateOrderId() {
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      const orderId = `${ORDER_ID_PREFIX}-${timestamp}-${randomNum}`;
      return orderId;
    }

    const cartData = await Cart.findOne({ user_id: userId }).populate('product.item');
    const orderId = generateOrderId();
    req.session.orderid=orderId
    const totalAmountToUse = req.session.total_after_discount !== undefined ? req.session.total_after_discount : cartData.total_amount;
    const options = {
      amount: (parseFloat(totalAmountToUse) ) * 100,
      currency: 'INR',
      receipt: orderId,
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        const newOrder = new Order({
          user: cartData.user_id,
          orderId: orderId,
          items: cartData.product,
          shippingAddress: address,
          paymentMethod: method,
          total_amount: totalAmountToUse,
          productPrice: cartData.pdtprice
        });

        // Save the newOrder to the database
        newOrder.save()
          .then(() => {
            // Send the order ID back to the front end
            res.status(200).json({ success: true,
              msg: 'Order created and processed successfully',
              order_id: order.id,
              amount: totalAmountToUse,
              key_id: RAZORPAY_ID_KEY,});
          })
          .catch((orderSaveError) => {
            console.error('Error saving order:', orderSaveError);
            res.status(500).json({ success: false, msg: 'Error saving order' });
          });
      } else {
        console.error('Razorpay order creation error:', err);
        res.status(400).json({ success: false, msg: 'Something went wrong!' });
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, msg: 'Checkout error' });
  }
};

const razorPayment = async (req, res) => {
  try {
    
    const method = req.query.method;
    const address = req.session.userAddress;
    const userId = req.session.user_id;
    const orderId = req.session.orderid

    const cartData = await Cart.findOne({ user_id: userId }).populate('product.item');
    const orderData= await Order.findOne({ orderId : orderId})
    req.session.orderid=null
    // Update product quantities
    const updatePromises = cartData.product.map(async (product) => {
      const newPrdctQty = product.item.stock - product.quantity;
      await Product.findByIdAndUpdate(
        { _id: product.item._id },
        { stock: newPrdctQty }
      );
    });

    // Execute the updatePromises
    Promise.all(updatePromises)
      .then(async () => {
        // Delete the cart
        await Cart.findOneAndDelete({ _id: cartData._id });
        req.session.userAddress = null;
        
        
          orderData.flag = "paid";
          await orderData.save();
        
      
        if(req.session.total_after_discount!==undefined){
          req.session.total_after_discount = null;
        }
        console.log(orderData)
        return res.render('checkout-complete', { new_order: orderData, cartData, address });

        // No response here
      })
      .catch((updateError) => {
        console.error('Error updating product quantities:', updateError);
        res.status(500).json({ success: false, msg: 'Error updating product quantities' });
      });
     
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, msg: 'Checkout error' });
  }
}
const clear = async (req, res) => {
  try {
    console.log("inside clear")
    const userId = req.session.user_id;
    const cartData = await Cart.findOne({ user_id: userId })
    if(req.session.total_after_discount !== undefined){
      req.session.total_after_discount=undefined
      await cartData.save();
    }
    
    const orders = await Order.find({ user: userId })
    orders.flag="paid"
    await orders.save();
  }
  catch(error){
    console.log(error)
  }
}

const clearSession = async (req,res)=>{
  console.log("inside clearsess")
  req.session.total_after_discount = null;
  res.json({ success: true });
}

const crypto = require('crypto');
const verifyPayment=(req, res)=>{
	
	console.log("inside verify")
	const {order_id, payment_id} = req.body;	

    

	const razorpay_signature = req.headers['x-razorpay-signature'];

    

	const key_secret =  process.env.RAZORPAY_SECRET_KEY;	

	
	let hmac = crypto.createHmac('sha256', key_secret);

	hmac.update(order_id + "|" + payment_id);
	
	
	const generated_signature = hmac.digest('hex');

	
	if(razorpay_signature===generated_signature){   
		
        res.json({success:true})
	}
	else{
    console.log("payment verification failed");
    res.json({success:false, message:"Payment verification failed"})
  }
   
};

const editAddressPage = async (req, res) => {
  try {
        const address1 = req.query.address;
        
        
        const parts = address1.split(',');
        const [name, mobile, email,addressLine1,addressLine2, city, state,country, zipcode] = parts;
      // const user_address = req.session.userAddress;
      // const user = await User.findOne({ address:address1  })
      console.log( address1)
      
      const nameParts = name.split(' ');
      const fName = nameParts[0];
      const lName = nameParts.slice(1).join(' ');
      if (address1 ){
          res.render('edit-address', {  
          // firstname: name.split(' ')[0],
          // lastname: name.slice(1).join(' '),
          firstname:fName,
          lastname: lName,
          mobile: mobile,
          address1: addressLine1,
          address2: addressLine2,
          email:email,
          city: city,
          state: state,
          country: country,
          zipcode: zipcode.split(':')[1].trim() ,

        })
          // console.log(pdtinfo._id)
      }
      else {
          res.redirect("/checkout/checkoutLoad");
      }

  }
  catch (error) {
      console.log(error.message);
  }
}
const editAddress = async (req, res) => {
  try {
    const { firstname,lastname,email,mobile,address1,address2,zipcode,country , state, city } = req.body;
    
    const userId = req.session.user_id;
    console.log(email);
    

    const updatedAddress = {
      firstname: firstname,
      lastname: lastname,
      email:email,
      mobile:mobile,
      zipcode: zipcode,
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      country:country,
    };
    const nameRegex = /^[A-Za-z\s\-']+$/;
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
        return res.status(400).json({ error: "Invalid name format." });
    }
    if (!firstname || !lastname || !email || !mobile || !address1 || !zipcode || !country || !state || !city) {
      return res.status(400).json({ error: "All fields are required." });
  }
  if (!firstname.trim() || !lastname.trim() || !email.trim() || !mobile.trim() ||
  !address1.trim() || !zipcode.trim() || !country.trim() || !state.trim() || !city.trim()) {
  return res.status(400).json({ error: "All fields are required." });
 }
      const addressUpdated = await User.findByIdAndUpdate({ _id: userId }, { $set: {address:updatedAddress} });
  

      

      //const pdtinfo = await product.findByIdAndUpdate({ _id: req.body.id }, { $set: { pdtID: req.body.pdtID, title: req.body.title, desc: req.body.desc, price: req.body.price, saleprice: req.body.saleprice, category: req.body.category, stock: req.body.stock, size: req.body.size, image: req.files.filename } })
      
      res.redirect("/checkout/checkoutLoad");
  }
  catch (error) {
      console.log(error.message);
  }
}
const deleteAddress = async (req, res) => {
  console.log(req.query.address)
  const parts = req.query.address.split(',');
  const [name, mobile, email,addressLine1,addressLine2, city, state,country, zipcode,addressId] = parts;
  
  console.log(req.query.address._id)
  try {
    // const addressId=req.query.address._id;
      const userId = req.session.user_id;
      // const addressId = req.body.formData.addressId;
      const user = await User.findOne({ _id: userId });

  if (user) {
  const addressIndex = user.address.findIndex(address => address._id.toString() ===  addressId);

  if (addressIndex !== -1) {
    // The address was found in the array, so you can use addressIndex to delete it
    const addressDeleted = await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { address: { _id: addressId} } }
    );

    console.log('Address deleted:', addressDeleted);
  } else {
    console.log('Address not found in the array');
  }
} else {
  console.log('User not found');
}
      
res.redirect("/checkout/checkoutLoad");
  }
  catch (error) {
      console.log(error.message)
  }
}



module.exports={
    checkoutLoad,
    saveAddress,
    addressLoad,
    createAddress,
    payment,
    razorPayment,
    editAddress,
    editAddressPage,
    deleteAddress,
    createOrder,
    verifyPayment,
    clear,
    saveTotalDiscount,
    clearSession
}
