const pool = require("../../config/mysql");
const { PatientHistory } = require("../../config/mongo");
const Joi = require("joi");

// Validation schema
const patientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).max(20).required(),
  address: Joi.string().min(5).max(200).required(),
});

// CREATE
exports.createPatient = async (body) => {
  const { error } = patientSchema.validate(body);
  if (error) throw error;

  const { name, email, phone, address } = body;

  await pool.query(
    `INSERT INTO patients (name,email,phone,address)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE name=name`,
    [name, email, phone, address]
  );

  await PatientHistory.updateOne(
    { patientEmail: email },
    { $setOnInsert: { patientName: name, appointments: [] } },
    { upsert: true }
  );

  return { message: "Patient created or already exists" };
};

// UPDATE
exports.updatePatient = async (email, body) => {
  const { error } = patientSchema.validate(body);
  if (error) throw error;

  const { name, phone, address } = body;

  const [result] = await pool.query(
    `UPDATE patients SET name=?, phone=?, address=? WHERE email=?`,
    [name, phone, address, email]
  );

  if (result.affectedRows === 0) return null;

  await PatientHistory.updateOne(
    { patientEmail: email },
    { $set: { patientName: name } }
  );

  return { message: "Patient updated" };
};

// DELETE
exports.deletePatient = async (email) => {
  await pool.query("DELETE FROM patients WHERE email = ?", [email]);
  await PatientHistory.deleteOne({ patientEmail: email });
  return { message: "Patient deleted" };
};

// HISTORY
exports.getHistory = async (email) => {
  return await PatientHistory.findOne({ patientEmail: email });
};