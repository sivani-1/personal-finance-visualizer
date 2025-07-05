import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema({
  amount: Number,
  date: Date,
  description: String,
});

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
