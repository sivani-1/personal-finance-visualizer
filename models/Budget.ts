import mongoose, { Schema } from "mongoose";

const BudgetSchema = new Schema({
  category: {
    type: String,
    enum: ["Food", "Rent", "Transport", "Shopping", "Utilities", "Other"],
  },
  amount: Number,
  month: String, // Format: "2025-07"
});

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);