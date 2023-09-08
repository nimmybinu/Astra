const mongoose=require("mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/AstraEcom");
mongoose.connect("mongodb+srv://efootballstreamz:lJt5RVnhSxkgEGF6@astraecom.svvby55.mongodb.net/");
const session = require('express-session');

const express=require("express");
const app=express();
const path=require('path');
const fs = require('fs');
const pdfMaker = require('pdfmake');
require("dotenv").config();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//twilio
const twilioApi=require('./routes/userRoutes');
app.use('/verifyotp',twilioApi);


//userRoute

const userRoute=require('./routes/userRoutes');
app.use('/',userRoute);

//adminRoute
const adminRoute=require('./routes/adminRoutes');
app.use('/admin',adminRoute);

//cartRoute

const cartRoute=require('./routes/cartRoutes');
app.use('/cart',cartRoute);

const checkoutRoute=require('./routes/checkoutRoutes');
app.use('/checkout',checkoutRoute);



//load static assets
app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/css',express.static(path.join(__dirname,'public/css')))
app.use('/img',express.static(path.join(__dirname,'public/img')))
app.use('/userImages',express.static(path.join(__dirname,'public/userImages')))

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
  });
  
  
  app.use((err, req, res, next) => {
    
    res.status(err.status || 500);

    res.render('error', {  status: err.status, error: err });
  });

app.listen(3008,function(){
    console.log("server is running")
 });
