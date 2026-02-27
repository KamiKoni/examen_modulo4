const pool = require("../config/mysql");
const { PatientHistory } = require("../config/mongo");
const xlsx = require("xlsx");

// this service reads an Excel file, then inserts data into both MySQL and MongoDB
exports.importExcel = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  console.log("Importing sheets:", sheetNames);

  // simple helpers
  const toJson = (sheet) => xlsx.utils.sheet_to_json(sheet, { defval: "" });

  // process patients sheet
  if (sheetNames.includes("patients")) {
    const patients = toJson(workbook.Sheets["patients"]);
    for (const p of patients) {
      const { name, email, phone, address } = p;
      if (!email) continue; // skip invalid rows
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
    }
  }

  // process doctors sheet
  if (sheetNames.includes("doctors")) {
    const doctors = toJson(workbook.Sheets["doctors"]);
    for (const d of doctors) {
      const { name, email, specialty } = d;
      if (!email) continue;
      await pool.query(
        `INSERT INTO doctors (name,email,specialty)
         VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE name=name`,
        [name, email, specialty]
      );
    }
  }

  // process appointments sheet (optional)
  if (sheetNames.includes("appointments")) {
    const appointments = toJson(workbook.Sheets["appointments"]);
    for (const a of appointments) {
      const { appointmentId, patientEmail, doctorName, appointment_date, amount_paid, treatment_code, treatment_description, treatment_cost } = a;
      if (!patientEmail) continue;
      // avoid duplicate MySQL records: assume a unique index on (patient_email,doctor_name,appointment_date,amount_paid)
      const [existing] = await pool.query(
        `SELECT id FROM appointments 
         WHERE patient_email=? AND doctor_name=? AND appointment_date=? AND amount_paid=? LIMIT 1`,
        [patientEmail, doctorName, appointment_date, amount_paid]
      );
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO appointments (appointment_id,appointment_date,patient_email,doctor_name,insurance_id,treatment_code,treatment_description,treatment_cost,amount_paid)
           VALUES (?,?,?,?,?,?,?,?,?)`,
          [appointmentId || null, appointment_date, patientEmail, doctorName, null, treatment_code || null, treatment_description || null, treatment_cost || null, amount_paid]
        );
      }
      // update mongodb history without duplicating entries
      await PatientHistory.updateOne(
        { patientEmail },
        { $addToSet: { appointments: { appointmentId: appointmentId || null, doctorName, appointmentDate: appointment_date, treatmentDescription: treatment_description || null, amountPaid: amount_paid } } },
        { upsert: true }
      );
    }
  }

  return { message: "import completed" };
};
