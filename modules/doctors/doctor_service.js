const pool = require("../../config/mysql");
const { PatientHistory } = require("../../config/mongo");
const Joi = require("joi");

// Validation schema
const doctorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  specialty: Joi.string().min(2).max(100).required(),
});

// CREATE
exports.createDoctor = async (body) => {
  const { error } = doctorSchema.validate(body);
  if (error) throw error;

  const { name, email, specialty } = body;
  await pool.query(
    `INSERT INTO doctors (name,email,specialty)
     VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE name=name`,
    [name, email, specialty]
  );

  return { message: "Doctor created or already exists" };
};

// UPDATE
exports.updateDoctor = async (id, body) => {
  const { error } = doctorSchema.validate(body);
  if (error) throw error;

  const { name, specialty } = body;

  const [old] = await pool.query("SELECT * FROM doctors WHERE id = ?", [id]);
  if (!old[0]) return null;

  const oldName = old[0].name;

  await pool.query(
    `UPDATE doctors SET name=?, specialty=? WHERE id=?`,
    [name, specialty, id]
  );

  if (oldName !== name) {
    await PatientHistory.updateMany(
      { "appointments.doctorName": oldName },
      {
        $set: { "appointments.$[elem].doctorName": name },
      },
      {
        arrayFilters: [{ "elem.doctorName": oldName }],
      }
    );
  }

  return { message: "Doctor updated" };
};

// DELETE
exports.deleteDoctor = async (id) => {
  const [old] = await pool.query("SELECT * FROM doctors WHERE id = ?", [id]);
  if (!old[0]) return null;

  const doctorName = old[0].name;

  await pool.query("DELETE FROM doctors WHERE id = ?", [id]);

  await PatientHistory.updateMany(
    {},
    { $pull: { appointments: { doctorName } } }
  );

  return { message: "Doctor deleted" };
};

// READ
exports.getDoctors = async (specialty) => {
  let query = "SELECT * FROM doctors";
  const params = [];
  if (specialty) {
    query += " WHERE specialty = ?";
    params.push(specialty);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

exports.getDoctorById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM doctors WHERE id = ?", [id]);
  return rows[0];
};