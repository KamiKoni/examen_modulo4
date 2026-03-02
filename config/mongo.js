const mongoose = require("mongoose");
const { Schema } = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    const options = {};
    // allow selecting a specific database via MONGO_DB env var, otherwise default to 'Logitech'
    const dbName = process.env.MONGO_DB || "Logitech";
    await mongoose.connect(process.env.MONGO_URI, { dbName, ...options });
    console.log("Connected to MongoDB Atlas (db:", dbName + ")");
  } catch (error) {
    console.error("CONNECTION ERROR:", error.message);
    process.exit(1);
  }
};

connectDB()
module.exports = mongoose;

const transactionSchema = new Schema({
  id_transaction: String,
  date: String,
  customer_name: String,
  customer_email: String,
  product_name: String,
  quantity: Number,
});

const transactionHistorySchema = new Schema({
  customer_emailEmail: { type: String, unique: true },
  customer_nameName: String,
  transaction: [transactionSchema],
});

module.exports.transactionHistory = mongoose.model(
  "transaction_histories",
  transactionHistorySchema
);
