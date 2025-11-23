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
      required: t3rue,
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

    created_by: {
      type: String,
      required: true,
    },

    creation_date: {
        type: Date,
        default: Date.now
     },

    updated_by: {
      type: String,
      default: null,
    },

    last_modified_date: {
        type: Date,
        default: Date.now
     },
    
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model("Transaction", TransactionSchema);
