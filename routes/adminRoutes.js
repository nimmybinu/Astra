const express=require("express");
const admin_route=express();

const session=require("express-session");
const config=require("../config/config");
admin_route.use(session({secret:config.sessionSecret,resave: false,saveUninitialized: false,}));



const bodyParser=require('body-parser')
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}))

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const path=require("path");
admin_route.use(express.static('public'));

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
const auth =require("../middlewares/adminAuth");

// const path=require("path");
admin_route.use(express.static('public'));

const adminController=require("../controllers/adminController");
admin_route.get('/',auth.isLogout,adminController.loadLogin)
admin_route.post('/',adminController.verifyLogin)
admin_route.get('/dashboard',auth.isLogin,adminController.adminDashboard)
admin_route.get('/logout',auth.isLogin,adminController.adminLogout)
admin_route.get('/block-user',auth.isLogin,adminController.blockUser)
admin_route.get('/dashboard/products',auth.isLogin,adminController.showProducts)
admin_route.get('/dashboard/products/add-product',auth.isLogin,adminController.addProductPage)
admin_route.post('/dashboard/products/add-product',upload.array('files'),adminController.addProduct)
admin_route.get('/dashboard/products/edit-product',auth.isLogin,adminController.editProductPage)
admin_route.post('/dashboard/products/edit-product',upload.array('files'),adminController.editProduct)
admin_route.get('/dashboard/products/delete-product',auth.isLogin,adminController.deleteProduct)
admin_route.get('/dashboard/categories',auth.isLogin,adminController.showCategories)
admin_route.get('/dashboard/categories/add-category',auth.isLogin,adminController.addCategoryPage)
admin_route.post('/dashboard/categories/add-category',adminController.addCategory)
admin_route.get('/dashboard/categories/delete-category',auth.isLogin,adminController.deleteCategory)
admin_route.get('/dashboard/categories/edit-category',auth.isLogin,adminController.editCategoryPage)
admin_route.post('/dashboard/categories/edit-category',adminController.editCategory)
admin_route.get('/dashboard/customers',adminController.customerPage)
// admin_route.get('/dashboard/coupon',auth.isLogin,adminController.showCoupon)
// admin_route.get('/dashboard/coupon/add-coupon',auth.isLogin,adminController.addCouponPage)
// admin_route.get('/dashboard/coupon/add-coupon',auth.isLogin,adminController.addCoupon)
admin_route.get('/dashboard/orders',auth.isLogin,adminController.showOrders)
admin_route.get('/dashboard/orderDetails',auth.isLogin,adminController.order_details )
//coupon route

admin_route.get('/coupon',auth.isLogin,adminController.showCoupon)
admin_route.get('/addcoupon',auth.isLogin,adminController.addCouponPage)
admin_route.post('/addcoupon',auth.isLogin,adminController.addCoupon)
admin_route.get('/dashboard/coupon/delete-coupon',auth.isLogin,adminController.deleteCoupon)
admin_route.get('/dashboard/coupon/edit-coupon',auth.isLogin,adminController.editCouponPage)
admin_route.post('/dashboard/coupon/edit-coupon',adminController.editCoupon)

admin_route.put('/status',auth.isLogin,adminController.change_status)

//sales Report

admin_route.get('/sales_report',auth.isLogin,adminController.salesReportLoad)
admin_route.post('/salesReportSort',auth.isLogin,adminController.salesReportSort)
admin_route.get('/salesReportDownload',auth.isLogin,adminController.salesReportDownload)

// admin_route.get("*",function(req,res){
//    res.redirect('/admin')
// })


module.exports=admin_route;