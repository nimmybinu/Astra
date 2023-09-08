const User = require('../models/userModel');
    const bcrypt =require('bcrypt')
    const product = require('../models/productModel');
    const category = require('../models/categoryModel');
    const Order = require('../models/orderModel');
    const Coupon = require('../models/couponsModel');
    const Cart = require('../models/cartModel');
    const twilio = require('twilio');
    const validator = require("validator");
    const { Error } = require('mongoose');
    const categoryModel = require('../models/categoryModel');
    // --otp verification twilio
    const accountSid = 'ACc1d2a3029fa7c1b104cdad18805003c5';
    const authToken = '1d9316e07bb59889c045175f34178c37';
    const fs = require('fs');
    const customTemplate=require('../models/invoice')
    const easyinvoice = require('easyinvoice');
    
    const path=require('path')
    const razorpay = require('razorpay'); 
    const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

    const razorpayInstance = new razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
    });
    const client = twilio(accountSid, authToken);
    //const client = require('twilio')(accountSid, authToken);
    let OTP=""
    let user;
    var sessionData;





    const securepassword=async(password)=>{
        try{
            const passwordHash= await bcrypt.hash (password,10);
            return passwordHash
        }
        catch(error){
            console.log(error.message)
        }
    }
    //signup
    const homeLoad= async(req,res)=>{
        try{
            // Set the response headers to disable caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Expires', '0');
    res.setHeader('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-store')
    
            return res.render('index')
            res.set('Cache-Control', 'no-store')
        }
        catch(error){
            console.log(error.message)
        }
    }
    const signupLoad= async(req,res)=>{
        try{
            
            return res.render('signup')
        }
        catch(error){
            console.log(error.message)
        }
    }
    //for send otp twilio
    const sendOtp=async(mobile)=>{
        try{
        
        let digits="123456789";
        
        for(let i=0;i<4;i++){
            OTP+=digits[Math.floor(Math.random() *10)];
        }
        await client.messages
    .create({
        body: `your otp is ${OTP}`,
        to: mobile, // Text your number
        from: '+16183684105', // From a valid Twilio number
    })
    .then(()=>console.log("otp sent"))
    

        }
        catch(error){
            console.log(error.message);
        }
        
    }
    const verifyOtp=async(req,res)=>{
        try{
            
            //console.log(req.body.otp)
            if(req.body.otp!=OTP){
                console.log("incorrect otp");
                return res.status(400)
                
            }
            const userData= user.save();
            if(userData){
            
                return res.render('login')
            }
        
        }
        catch(error){
            console.log(error.message)
        }
    }


    const insertUser=async(req,res)=>{
        try{
            const spassword= await securepassword(req.body.password)
            user=new User({
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
            
                password:spassword,
                is_admin:0,
            });
            
            
                sendOtp(req.body.mobile);
                return res.render('verifyotp')
        
        }
        catch(error){
            console.log(error.message)
        }


    }
    const loginLoad= async(req,res)=>{
        try{
            // Set the response headers to disable caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Expires', '0');
    res.setHeader('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-store')
            res.render('login')
        }
        catch(error){
            console.log(error.message)
        }
    }
    const verifyLogin = async(req,res)=>{
    
        try{
            const email=req.body.email;
            const password=req.body.password;
            console.log(req.body.email)
            const userData=await User.findOne({email:email});
            
            if(userData){
                const passwordMatch=await bcrypt.compare(password,userData.password);
                if(passwordMatch && userData.isBlocked==false){
                    
                    req.session.user_id=userData._id;
                    sessionData=userData._id;
                    console.log("yes!!")
                    
                    return res.redirect('/');
                
                }
                else{
                    console.log("pass incorrect!!")
                    return res.render('login',{message:"password is incorrect"})
                    
                }
            }
            else{
                console.log("email incorrect")
                return res.render('login',{message:"username is incorrect"})
                
            }
        
            }
            catch{
                console.log(error.message);
            }
        


    }
    // userController.js
    setUserSession = (req, res) => {
        const userId = 'your_user_id'; // Replace with the actual user ID from the request
        req.session.userId = userId; // Set the user ID in the session
        res.send(`User ID ${userId} set in the session.`);
    };
    
    const userLogout= async(req,res)=>{
        try{
             req.session.destroy();
            // delete req.session.user_id;
        return res.redirect('/');

        }catch(error){
            console.log(error.message);
        }
    }
    const shopLoad= async(req,res)=>{
        try{
            var search=""
            if(req.query.search){
                search=req.query.search;
            }
            var page = 1;
            if (req.query.page) {
              page = req.query.page;
            }
            const limit = 2;
            const products = await product
            .find({
            
            $or: [
            { title: { $regex: "." + search + ".", $options: "i" } },
            
            ],
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

            const count = await product
            .find({
             
            $or: [
            { title: { $regex: "." + search + ".", $options: "i" } },
            
            ]
            })
            .countDocuments();

    
            // const products = await product.find({});
           
            const  categories = await  category.find({});
            return res.render('shop', { products,categories,totalpages: Math.ceil(count / limit),
            currentPage: page})
        }
        catch(error){
            
            res.status(500).render('error', { message: 'Internal Server Error' });
        }
    }
    const interconnect=async(req,res)=>{
        try{
            var search="";
            if(req.query.search){
                search=req.query.search;
            }
             const pdts = await product.find({pdt:{$regex:'.'+search+'.',$options:'i'}});
             res.json({ pdts });
        }
        catch(err){
            console.log(err);
        }
    }
    const shopCategoryLoad= async(req,res)=>{
        try{
            var search=""
            if(req.query.search){
                search=req.query.search;
            }
            var page = 1;
            if (req.query.page) {
              page = req.query.page;
            }
            const limit = 4;
            const categoryName  = req.query.name
            const products = await product
            .find({
                category: categoryName
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

            const count = await product
            .find({
             
            $or: [
            { title: { $regex: "." + search + ".", $options: "i" } },
            
            ]
            })
            .countDocuments();

    
            // const products = await product.find({});
           
            const  categories = await  category.find({});
            return res.render('shop', { products,categories,totalpages: Math.ceil(count / limit),
            currentPage: page})
            // const categoryName  = req.query.name
            // const  categories = await  category.find({});
            // const products = await product.find({ category: categoryName })
          
            // return res.render('shop', { products,categories})
        } catch (error) {
          console.log(error.message);
          res.status(500).json({ error: "Failed to fetch products" });
        }
    }
    const shopDetail= async(req,res)=>{
        try{
            const productId = req.query.id;
            const pdtDetail=await product.findOne({_id:productId});
            return res.render('shopdetail',{pdtDetail})
        }
        catch(error){
            console.log(error.message)
        }
    }
    //order
    const myorderLoad= async(req,res)=>{
        
            try {
              const user_id = req.session.user_id;
              const userData = await User.find({ _id: user_id })
              const orders = await Order.find({ user: user_id })
                .populate({
                  path: 'items.item',
                  model: 'products'
                })
                .sort({ createdAt: -1 });
          
              res.render('myOrders', { orders,userData });
          
              orders.forEach((order) => {
                console.log(order);
              });
            } catch (err) {
              console.log(err);
            }
          
          
    }
    const cancel_order=async (req,res)=>{

        try{
            const product_id=req.query.prdctId
            const ORD_id=req.query.ordId
            const qty=req.query.qty
            const Id = req.session.user_id
            const orderData = await Order.findOne({orderId:ORD_id})
            const userData = await User.findOne({_id: Id})
            const prdctStat=orderData.items.find(data=> data.item._id==product_id)
            prdctStat.status="cancelled"
            orderData.markModified('items')
            const savedStatus = await orderData.save()
            const data = await product.findOne({_id:product_id})
            const changd_qty = data.stock + parseInt(qty);
            data.stock=changd_qty
            await data.save()
            if(orderData.paymentMethod==="online"){
                if(userData.cashback!==undefined && orderData.items.length==1){
                    const updatedUser = await User.findByIdAndUpdate({_id: Id}, {$inc: {wallet: prdctStat.sub_total-userData.cashback}}, { new: true });
                    updatedUser.cashback = null;
                    await updatedUser.save();  
                }else{
                    const updatedUser = await User.findByIdAndUpdate({_id: Id}, {$inc: {wallet: prdctStat.sub_total}}, { new: true });
                    updatedUser.cashback = null;
                    await updatedUser.save();
                }
                
            }
            res.json({message:'Order Cancelled!'})
        } catch(err){
          console.log(err)
          res.json({message:err})
        }
    }
    
    const return_order=async (req,res)=>{
      try{
        const {order_id,product_id}=req.query 
        console.log(`orderid=${order_id} prodv=${product_id}`);
        const order_data = await Order.findById({_id:order_id})
        const Id = req.session.user_id
        let product=order_data.items.find(prdct=> prdct.item._id==product_id)
        console.log(product);
        product.status="return"
        order_data.markModified('items')
        const data = await order_data.save()
        console.log('hi'+data);
        if(order_data.paymentMethod==="online"){
            if(userData.cashback!==undefined && order_data.items.length==1){
                const updatedUser = await User.findByIdAndUpdate({_id: Id}, {$inc: {wallet: prdctStat.sub_total-userData.cashback}}, { new: true });
                updatedUser.cashback = null;
                await updatedUser.save();  
            }else{
                const updatedUser = await User.findByIdAndUpdate({_id: Id}, {$inc: {wallet: prdctStat.sub_total}}, { new: true });
                updatedUser.cashback = null;
                await updatedUser.save();
            }
            
        }
        res.json({message:'Return requested'})
      } catch(err){
          res.json({message:'somthing went wrong'})
      }
    }

    //coupon

    const applyCoupon=async (req,res)=>{
        try{
            const coupon = req.body.couponcode;
            console.log(coupon)
            const cartTotal = parseFloat(req.body.cartTotal);
            console.log(cartTotal)
            const validCoupon=await Coupon.findOne({name:coupon});
            if(validCoupon){
                const discountAmount = (validCoupon.discount / 100) * cartTotal;
                const discountedTotal = cartTotal - discountAmount;
                console.log(discountAmount);
                console.log(discountedTotal);



            res.json({
                success: true,
                message: `Coupon applied: ${validCoupon.discount}% off!`,
                discountedTotal: discountedTotal.toFixed(2),
                discountAmount: discountAmount.toFixed(2)
            });
            const userId = req.session.user_id;
            // const updatedCartData = await  Cart.findOneAndUpdate({ user_id: userId  },{ $set: { total_after_discount: discountedTotal} }, { new: true });
            // await updatedCartData.save();
            req.session.total_after_discount= discountedTotal
            }
            else {
                res.json({ success: false, message: 'Invalid coupon code. Please try again.' });
            }
            
            // const cartData = await Cart.findOne({ user_id: userId }).populate('product.item');
            //  let total_after_discount=cartData.total_amount-(cartData.total_amount*validCoupon.discount)/100
            
           
        }
        catch(err){
            // res.json({message:'somthing went wrong'})
            // res.status(500).json({ success: false, message: 'An error occurred while processing the coupon.' });
            console.log(err);
    
        }
    }
    const sortPrice=async (req,res)=>{
        try {
            const id = parseInt(req.params.id);
            const categoryData = await category.find({});
            // const session = req.session.user_id;
            const productData = await product.find({});
            // const userData = await User.findById(session);
            const page = parseInt(req.query.page) || 1;
            const limit = 2;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
        
            let sortedData;
            if (id == 1) {
              sortedData = productData.sort((a, b) => a.saleprice - b.saleprice);
            //   sortedData = productData.sort({saleprice:1});
            } else {
              sortedData = productData.sort((a, b) => b.saleprice - a.saleprice);
            //   sortedData = productData.sort({saleprice:-1});
            }
            console.log(sortedData)
            if (sortedData) {
              const productCount = sortedData.length;
              const totalPages = Math.ceil(productCount / limit);
              const paginatedProducts = sortedData.slice(startIndex, endIndex);
        
              res.render("shop", {
                // session,
                categories: categoryData,
                products: paginatedProducts,
                currentPage: page,
                totalpages: totalPages,
                // user: userData,
              });
            } else {
              res.render("shop", { products: [],categories: categoryData });
            }
          } catch (error) {
            console.log(error)
          }
        
    }
    const filterByPrice=async (req,res)=>{
        try {
            const selectedValues = req.query.selectedValues; 
            console.log(selectedValues)
            let query = {};
    
            if (selectedValues && Array.isArray(selectedValues)) {
                const priceRanges = {
                    'price-1': { $lt: 1500 },
                    'price-2': { $gte: 1500, $lte: 5000 },
                    'price-3': { $gt: 5000 },
                };
    
                const priceQueries = selectedValues.map(value => priceRanges[value]);
    
                if (priceQueries.length > 0) {
                    query = { $or: priceQueries };
                }
            }
    
            const filteredProducts = await product.find(query);
            console.log(filteredProducts)

            const categoryData = await category.find({});
     
            const page = parseInt(req.query.page) || 1;
            const limit = 2;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            if (filteredProducts) {
                const productCount = filteredProducts.length;
                const totalPages = Math.ceil(productCount / limit);
                const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
          
                res.render("shop", {
                  // session,
                  categories: categoryData,
                  products: paginatedProducts,
                  currentPage: page,
                  totalpages: totalPages,
                  // user: userData,
                });
              } else {
                res.render("shop", { products: [],categories: categoryData });
              }
          } catch (error) {
            console.log(error)
          }
        
    }
    const getInvoice=async(req,res)=>{


        try{
        
        const orderId=req.params.id
        const order=await Order.findOne({_id:orderId}).populate({
            path: 'items.item',
            model: 'products'
          })
        const products=[]
      
      for(let i=0;i<order.items.length;i++){
       const productDetails= {
      
          "quantity": order.items[i].quantity,
          "description": order.items[i].item.desc,
       
          "price": order.items[i].item.saleprice,   
         
      }
       products.push(productDetails)
      }
      
        const data = {
      
          "client": { 
      
            "company": order.shippingAddress,
            // "address":  order.shippingAddress.buildingName,
            // "zip":  order.shippingAddress.pincode,
            // "city": order.shippingAddress.city,
            // "country":  order.shippingAddress.state,
          },
      
          // Now let's add our own sender details
          "sender": {
              "company": "Aatra PVT LTD",
              "address": "Sample Street 123",
              "zip": "683594",
              "city": "Kochi",
              "country": "India"
          },
      
      
          // Let's add some standard invoice data, like invoice number, date and due-date
          "information": {
            // Invoice number
            "number": order.orderId,
            // Invoice data
            "date": order.createdAt,
            // Invoice due date
            
        },
      "products": products,
        
      "bottom-notice": "This is a computer generated invoice.It doesnt require a physical signature",
          "settings": {
              "currency": "INR", 
              "tax-notation": "gst"// See documentation 'Locales and Currency' for more info. Leave empty for no currency.
              /* 
               "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')         
               "tax-notation": "gst", // Defaults to 'vat'
               // Using margin we can regulate how much white space we would like to have from the edges of our invoice
               "margin-top": 25, // Defaults to '25'
               "margin-right": 25, // Defaults to '25'
               "margin-left": 25, // Defaults to '25'
               "margin-bottom": 25, // Defaults to '25'
               "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
               "height": "1000px", // allowed units: mm, cm, in, px
               "width": "500px", // allowed units: mm, cm, in, px
               "orientation": "landscape", // portrait or landscape, defaults to portrait         
               */
          },
       
          /*
              Last but not least, the translate parameter.
              Used for translating the invoice to your preferred language.
              Defaults to English. Below example is translated to Dutch.
              We will not use translate in this sample to keep our samples readable.
           */
        
      
          /*
              Customize enables you to provide your own templates.
              Please review the documentation for instructions and examples.
              Leave this option blank to use the default template
           */
              customize: {
                template: btoa(customTemplate), 
              },
      };
        
         
      let file="Astra_"+order.orderId+".pdf"
      
      easyinvoice.createInvoice(data, function (result) {
        // Set the appropriate headers for browser download
        res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
        res.setHeader('Content-Type', 'application/pdf');
      
        // Send the generated PDF data as response to trigger browser download
        res.send(Buffer.from(result.pdf, 'base64'));
      });
      } catch (error) {
        // Handle the error here
        console.error("An error occurred:", error);
        res.status(500).send("Internal server error");
      }
      
      }

      const loadWallet=async(req,res)=>{

        const userId = req.session.user_id;
      
        const user=await User.findOne({_id:userId})
      
        const walletBalance=user.wallet
      
      
        res.render('wallet',{walletBalance}) 
      
      }
       

    module.exports={
        homeLoad,
        insertUser,
        signupLoad,
        sendOtp,
        verifyOtp,
        loginLoad,
        verifyLogin,
        userLogout,
        shopLoad,
        shopDetail,
        shopCategoryLoad,
        myorderLoad,
        cancel_order,
        return_order,
        applyCoupon,
        interconnect,
        sortPrice,
        getInvoice,
        loadWallet,
        filterByPrice,
        
    
    }