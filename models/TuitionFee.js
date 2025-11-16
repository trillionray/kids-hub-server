const mongoose = require('mongoose');

const tuitionSchema = new mongoose.Schema(
  {
    EnrollmentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Enrollment",  // name of the model
      required: true
    },

    DueDateId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "penalty",
    },

    TotalTuitionFee: { 
      type: Number, 
      required: true 
    },
    
    RecurringFee: { 
      type: Number, 
      required: true 
    },

    TotalAmountPaid: { 
      type: Number, 
      default: 0 
    }
  },
  {
    timestamps: {
      createdAt: 'creation_date',
      updatedAt: 'last_modified_date'
    }
  }
);

module.exports = mongoose.model('Tuitionfee', tuitionSchema);
