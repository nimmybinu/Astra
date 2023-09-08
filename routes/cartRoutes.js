const express=require("express");
const cart_route=express();

const session=require("express-session");
const config=require("../config/config");
cart_route.use(session({secret:config.sessionSecret,resave: false,saveUninitialized: false,}));



const bodyParser=require('body-parser')
cart_route.use(bodyParser.json());
cart_route.use(bodyParser.urlencoded({extended:true}))

cart_route.set('view engine','ejs')
cart_route.set('views','./views/user')

const path=require("path");
cart_route.use(express.static('public'));

const multer =require("multer")
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/userImages'));
     },
     filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname;
        cb(null,name);
     }


});
const upload= multer({storage:storage});
const auth =require("../middlewares/auth");



const cartController=require("../controllers/cartController");
cart_route.get('/add-product',cartController.add_to_cart)
//cart_route.post('/',auth,cartController.add_to_cart)
cart_route.get('/add-product/change_qty',cartController.change_qty)
cart_route.delete('/add-product/remove-cart',cartController.remove_cart)
module.exports=cart_route;