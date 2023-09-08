const mongoose = require("mongoose");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    mobile:{
        type:String,
        required:true
    },
 
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    address: [{
        firstname:{
          type: String,
        },
        lastname:{
            type: String,
          },
        email:{
            type:String,
            unique: true
        },
        mobile:{
          type: Number
        },
        address1:{
          type:String
        },
        address2:{
          type:String
        },
        zipcode:{
          type:String
        },
        state:{
          type:String
        },
        
       
        city:{
          type:String
        },
         country:{
          type:String
        }    
      }],
      wallet :{
        type:Number,
        default:0
      },
      cashback :{
      type:Number,
      
  }
},
    {
        timestamps:true
    }
  
);
module.exports= mongoose.model('User',userSchema)