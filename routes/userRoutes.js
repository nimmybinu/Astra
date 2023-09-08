const express=require("express");
const user_route=express();


const session=require("express-session");
const config=require("../config/config");
user_route.use(session({secret:config.sessionSecret,resave: false,saveUninitialized: false,}));



user_route.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
  });

const auth =require("../middlewares/auth");


user_route.set('view engine','ejs')
user_route.set('views','./views/user')

const bodyParser=require('body-parser')
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

const userController=require("../controllers/userController");
user_route.get('/',userController.homeLoad)
user_route.get('/signup',auth.isLogout,userController.signupLoad)
//user_route.get('/signup',userController.insertUser)
user_route.post('/signup',userController.insertUser)
user_route.post('/signup/verifyotp',userController.verifyOtp)
user_route.get('/login',auth.isLogout,userController.loginLoad)
//user_route.post('/login',userController.verifyLogin)
user_route.post('/login', (req, res) => {
    req.session.loggedin = true;
    userController.verifyLogin(req, res); // Pass req and res to the verifyLogin function
  });
  user_route.get('/logout',auth.isLogin,userController.userLogout)
  user_route.get('/shop',userController.shopLoad)
  user_route.get('/shopdetail',userController.shopDetail)
  user_route.get('/shopCategoryLoad',userController.shopCategoryLoad)

  //order
  user_route.get('/myorder',userController.myorderLoad)
  user_route.delete('/cancelorder',userController.cancel_order)
  user_route.get('/returnorder',userController.return_order)

  //Coupon

  user_route.post('/applycoupon',userController.applyCoupon)
  
  //invoice
  user_route.get('/invoice/:id',userController.getInvoice)

  user_route.get('/sortPrice/:id', userController.sortPrice);
  user_route.get('/filterByPrice', userController.filterByPrice);
  
  user_route.get('/wallet',userController.loadWallet)
  // user_route.get('/interconnect',userController.interconnect)
module.exports=user_route;
