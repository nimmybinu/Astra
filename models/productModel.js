const mongoose = require("mongoose");
const productSchema=new mongoose.Schema({
    pdtID:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    desc:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:String,
        required:true
    },
    saleprice:{
        type:String,
        required:true
    },
 
    category:{
        type:String,        
        ref:"category"
    },
    stock:{
        type:Number,
        // required:true,
    },
   
    size:{
        type:String,
        enum: ['S','M','L']
    },
    image:{
        type:Array,
        required:true,
        
    },
   
    // color:{
    //     type:String,
    //     enum:["silver","rosegold","gold"]
        
    // },
},
    {
        timestamps:true
    }
  
);
module.exports= mongoose.model('products',productSchema)