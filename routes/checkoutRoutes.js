const express=require("express");
const check_route=express();

const session=require("express-session");
const config=require("../config/config");
check_route.use(session({secret:config.sessionSecret,resave: false,saveUninitialized: false,}));



const bodyParser=require('body-parser')
check_route.use(bodyParser.json());
check_route.use(bodyParser.urlencoded({extended:true}))

check_route.set('view engine','ejs')
check_route.set('views','./views/user')

const path=require("path");
check_route.use(express.static('public'));
const auth =require("../middlewares/auth");



const checkoutController=require("../controllers/checkoutController");

check_route.get('/checkoutLoad',checkoutController.checkoutLoad);
check_route.get('/addressLoad',checkoutController.addressLoad);
check_route.post('/addressLoad',checkoutController.createAddress);
check_route.get('/editAddress',checkoutController.editAddressPage);
check_route.post('/editAddress',checkoutController.editAddress);
check_route.get('/deleteAddress',checkoutController.deleteAddress);


check_route.get('/shipping-address-save',checkoutController.saveAddress);
check_route.get('/total-discount',checkoutController.saveTotalDiscount);
check_route.post('/clear-total-after-discount',checkoutController.clearSession);
check_route.get('/checkout-payment',checkoutController.payment);
check_route.get('/razor-payment',checkoutController.razorPayment);
check_route.post('/razor_order',checkoutController.createOrder);
check_route.post('/verifyPayment',checkoutController.verifyPayment);
check_route.get('/clear',checkoutController.clear);

module.exports=check_route;
