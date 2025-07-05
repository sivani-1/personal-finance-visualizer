// import mongoose, { Schema } from "mongoose";

// const TransactionSchema = new Schema({
//   amount: Number,
//   date: Date,
//   description: String,
// });

// export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);


import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema({
  amount: Number,
  date: Date,
  description: String,
  category: {
    type: String,
    enum: ["Food", "Rent", "Transport", "Shopping", "Utilities", "Other"],
    default: "Other",
  },
});

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);