const mongoose = require("mongoose");
const { Schema } = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const options = {};
    // allow selecting a specific database via MONGO_DB env var, otherwise default to 'SaludPlus'
    const dbName = process.env.MONGO_DB || "SaludPlus";
    await mongoose.connect(process.env.MONGO_URI, { dbName, ...options });
    console.log("Connected to MongoDB Atlas (db:", dbName + ")");
  } catch (error) {
    console.error("CONNECTION ERROR:", error.message);
    process.exit(1);
  }
};

connectDB()
module.exports = mongoose;

const AppointmentSchema = new Schema({
  appointmentId: String,
  date: String,
  doctorName: String,
  specialty: String,
  treatmentDescription: String,
  amountPaid: Number,
});

const PatientHistorySchema = new Schema({
  patientEmail: { type: String, unique: true },
  patientName: String,
  appointments: [AppointmentSchema],
});

module.exports.PatientHistory = mongoose.model(
  "patient_histories",
  PatientHistorySchema
);
