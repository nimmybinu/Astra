const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required:true
    },
    orderId:{
        type:String
    },
    items:{
      type:Array
    },
    productPrice: {  
      type: Number,
     
   },
    shippingAddress: {
        type:String
    },
    status: {
      type: String,
      enum: ['placed', 'shipped', 'delivered'],
      default: 'placed'
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'COD',],
      required: true
    },
    flag:{
      type:String
    },
  
    total_amount:{
        type:Number
    },

  }, { timestamps: true });
  
module.exports = mongoose.model('order', orderSchema);
