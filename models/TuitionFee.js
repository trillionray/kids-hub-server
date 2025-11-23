const mongoose = require('mongoose');

const tuitionSchema = new mongoose.Schema(
  {
    enrollment_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Enrollment",  // name of the model
      required: true
    },

    due_date: { 
      type: Number,
      required: false,   
    },

    total_tuition_fee: { 
      type: Number, 
      required: true 
    },
    
    recurring_fee: { 
      type: Number, 
      required: true 
    },

    transactions: [{
      ref: "Transactions",
      type: mongoose.Schema.Types.ObjectId, 
    }],

    total_amount_paid: { 
      type: Number, 
      default: 0 
    },
  }
);

module.exports = mongoose.model('Tuitionfee', tuitionSchema);
