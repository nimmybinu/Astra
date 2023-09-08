const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const validator = require("validator");
const User = require('../models/userModel');

// Add product to cart
const add_to_cart = async (req, res) => {
  try {
    const prdct_id = req.query.product;
    const user_id = req.session.user_id;
    // const userData = await User.findById({ _id: req.session.user_id });
    //   const address = userData.address;
    // if(!user_id){
    //   // res.render('header', { message: "Please login to see cart!" })
    //   return res.redirect('/header');
    // }

    const productData = await Product.findById(prdct_id);
    // if (!productData) {
    //   return res.status(404).json({ error: 'Product not found' });
    // }

    //   // Step 1: Check if the user-selected size exists in the overall product database
    //   const sizeExists = await Product.exists({ size: size });
    
    //   if (!sizeExists) {
    //     return res.status(400).json({ error: 'Selected size is not available for any product' });
    //   }
    
    let foundCart = await Cart.findOne({ user_id: user_id });

    if (!foundCart) {
      const newCart = new Cart({
        user_id: user_id,
        product: [],  
        total_amount: 0,
      });
      
      await newCart.save();
      await viewCart(res, user_id, prdct_id); // Pass the response object as an argument to the function
    } else {
      // Cart.findOneAndUpdate({ "product.$.item._id": prdct_id  },{ $set: { "product.$.size": size } }, { new: true });

      await viewCart(res, user_id, prdct_id); // Pass the response object as an argument to the function
    }
  } catch (err) {
    res.send(err);
  }
};

async function viewCart(res, user_id, prdct_id) {
  try {
    const userData = await User.findById({ _id: user_id });
    const address = userData.address;
    if (!prdct_id) {
      let cartData = await Cart.findOne({ user_id: user_id }).populate(
        "product.item"
      );
      res.render("cart", { cartData ,address});
    } else {

      let productData = await Product.findById(prdct_id);
      let cartData = await Cart.findOne({ user_id: user_id }).populate(
        "product.item"
      );

      let foundPrdctId = null;
      let foundProduct = null;

      for (let prdct of cartData.product) {
        if (prdct.item._id == prdct_id) {
          foundPrdctId = prdct.item._id;
          foundProduct = prdct;
          break;
        }
      }

      if (!foundPrdctId) {
        const qty = productData.quantity <= 0 ? 0 : 1;
        const productPrice = qty >= 1 ? parseFloat(productData.saleprice) : 0;

        if (productData.stock <= 0) {
          return res.send("Product is out of stock.");
        }

        const newItem = {
          item: productData._id,
          quantity: qty,
          sub_total: productPrice,
          size:productData.size,
          pdtprice:productData.saleprice
        };
        cartData.total_amount = parseFloat(cartData.total_amount);
       
        cartData.total_amount += productPrice;
        cartData.product.push(newItem);

      }else {
          // Product is already in the cart, update the quantity and price
          foundProduct.quantity += 1; // Increment the quantity by 1, you can modify this as needed
          foundProduct.sub_total += parseFloat(productData.saleprice); // Update the subtotal based on the product price
          cartData.total_amount += parseFloat(productData.saleprice);
        }

        await cartData.save();
        cartData = await Cart.findOne({ user_id: user_id }).populate(
          "product.item"
        );
         

        res.render("cart", { cartData ,address});
      
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}



const remove_cart = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const product_id = req.query.id;

    
    const cartData = await Cart.findOne({ user_id: user_id });

    // Step 2: Find the product in the cart using async/await
    const productIndex = cartData.product.findIndex((prdct) => prdct.item.toString() === product_id);
    const removedProduct = cartData.product[productIndex];
    const subtotal = parseFloat(removedProduct.sub_total);

    // Step 3: Remove the product from the cart using async/await
    cartData.product.splice(productIndex, 1);

    
    cartData.total_amount = cartData.product.reduce((total, prdct) => total + parseFloat(prdct.sub_total), 0);

    
    await cartData.save();

    
    res.send({ cartDltItm: { item: product_id }, updateTotal: cartData.total_amount });
  } catch (err) {
    res.send(err);
  }
};


const change_qty = async (req, res) => {
  try {
    res.set('cache-Control','no-store')
    const prdctId = req.query.prdctId;
    const val = parseInt(req.query.val);
    const user_id = req.session.user_id;
    const productQty = req.query.productQty;
    // const price = req.query.price;
    
    // Find the cart
    const cartData = await Cart.findOne({ user_id: user_id }).populate('product.item');
    
    
    // Check if the product already exists in the cart
    let foundProduct = null;
    for (let prdct of cartData.product) {
      if (prdct.item._id == prdctId) {
        foundProduct = prdct;
        break;
      }
    }
    if (!foundProduct) {
      // If the product is not found, respond with an error
      return res.status(404).json({ error: 'Product not found' });
    }
    


    let qty = foundProduct.quantity + val < 1 ? 1 : foundProduct.quantity + val;
   if(qty >= productQty){
    var flag=true;
   }
  
    qty = qty >= productQty ? productQty : qty;
    const prodctPrice = req.query.price;
    const sub_total = qty * prodctPrice;

    foundProduct.sub_total = sub_total;
    foundProduct.quantity = qty;

   

    // Save the updated cart
    await cartData.save();

    

    // Calculate the total amount
    let total = 0;
    cartData.product.forEach(amnt => {
      total += amnt.sub_total;
    });
    cartData.total_amount = total;

    // Save the cart with updated total amount
    await cartData.save();
   
    res.send({ qty, sub_total, total,flag });
    // res.json({ qty, sub_total, total });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports={
    add_to_cart,
    remove_cart,
    change_qty 
}
