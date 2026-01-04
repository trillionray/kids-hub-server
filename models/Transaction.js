
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    enrollment_id: { // ex. 69343a954cff8116ff42b936
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    transaction_type: { //. ex Monthly, Downpayment, Program, Initial Evaluation
      type: String,
      required: true,
    },

    amount: { // ex. Actual payment amount
      type: Number,
      required: true,
    },

    mode_payment: { // gcash, bank, cash
      type: String,
      required: true,
    },

    reference_no: { // ex. Ref-123456abcd
      type: String, 
      default: null,
    },

    receipt_date: { // When did the payment transaction made 
      type: Date,
      required: true,
    },

    comment: { //comment
      type: String,
      default: "",
    },

    picture_file_path: { //file path
      type: String,
      default: "",
    },
    
    total_required_amount: { // ex. Actual payment amount
      type: Number,
      required: true,
    },

    is_due:{ //boolean 
      type:Boolean,
      default:false,
    },

    amount_due: { //penalty amount 
      type: Number,
      default: 0,
    },

    excess_amount: { //If there is a excess amount 
      type: Number,
      default: 0,
    },

    payment_status: { //complete , overpaid, underpaid
      type: String,
      default: null,
    },

    created_by: { //user id
      type: String,
      required: true,
    },

    updated_by: { //user id
      type: String,
      required: true,
    },
    
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model("Transaction", TransactionSchema);