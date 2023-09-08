const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user_id:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  product:[
    {
      item:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'products'
      },
      quantity:{
        type: Number,
      },
      sub_total:{
        type:Number
      },
      pdtprice:{
        type:Number
      },
      status:{
        type: String,
        enum: ['placed', 'shipped', 'delivered','cancelled','return','refund-approved','return-denied'],
        default: 'placed'
      },
      size:{
        type: String,
        required:true
      }
      
    }
],
  total_amount:{
    type:Number
  },
  total_after_discount:{
    type:Number,  
  }
 
})
module.exports = mongoose.model("cart", cartSchema);
