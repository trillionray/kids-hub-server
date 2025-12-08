import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    enrollment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    transaction_type: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    mode_payment: {
      type: String,
      required: true,
    },

    reference_no: {
      type: String,
      default: null,
    },

    receipt_date: {
      type: Date,
      required: true,
    },

    comment: {
      type: String,
      default: "",
    },

    picture_file_path: {
      type: String,
      default: "",
    },
    
    is_due:{
      type:Boolean,
      default:false,
    },

    amount_due: {
      type: Number,
      default: 0,
    },

    excess_amount: {
      type: Number,
      default: 0,
    },


    payment_status: {
      type: String,
      default: null,
    },

    created_by: {
      type: String,
      required: true,
    },

    updated_by: {
      type: String,
      required: true,
    },
    
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model("Transaction", TransactionSchema);