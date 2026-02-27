const pool = require("../config/mysql");
const { PatientHistory } = require("../config/mongo");
const xlsx = require("xlsx");
const fs = require("fs");
const { parse: parseCSV } = require("csv-parse/sync");

// this service reads an Excel or CSV file, then inserts data into both MySQL and MongoDB
exports.importExcel = async (filePath, originalName = "") => {
  let appointments = [];
  let patients = [];
  let doctors = [];
  let insurances = [];

  // Detect file type from original filename (since multer doesn't preserve extension)
  const isCSV = originalName.toLowerCase().endsWith(".csv") || originalName.includes(".csv");
  console.log("File type detection - originalName:", originalName, "isCSV:", isCSV);
  
  if (isCSV) {
    // Parse CSV file
    console.log("Detected CSV format, parsing...");
    const csvData = fs.readFileSync(filePath, "utf-8");
    const records = parseCSV(csvData, { columns: true });
    console.log("CSV records:", records.length);

    // Extract unique entities from CSV records
    const patientsMap = new Map();
    const doctorsMap = new Map();
    const insurancesMap = new Map();

    records.forEach(record => {
      // Patients
      const patientKey = record.patient_email;
      if (!patientsMap.has(patientKey)) {
        patientsMap.set(patientKey, {
          name: record.patient_name,
          email: record.patient_email,
          phone: record.patient_phone,
          address: record.patient_address
        });
      }

      // Doctors
      const doctorKey = record.doctor_email;
      if (!doctorsMap.has(doctorKey)) {
        doctorsMap.set(doctorKey, {
          name: record.doctor_name,
          email: record.doctor_email,
          specialty: record.specialty
        });
      }

      // Insurances
      if (record.insurance_provider && !insurancesMap.has(record.insurance_provider)) {
        insurancesMap.set(record.insurance_provider, {
          name: record.insurance_provider,
          coverage_percentage: record.coverage_percentage
        });
      }

      // Appointments
      appointments.push({
        appointmentId: record.appointment_id,
        appointment_date: record.appointment_date,
        patientEmail: record.patient_email,
        doctorName: record.doctor_name,
        treatment_code: record.treatment_code,
        treatment_description: record.treatment_description,
        treatment_cost: parseFloat(record.treatment_cost) || null,
        amount_paid: parseFloat(record.amount_paid) || null
      });
    });

    patients = Array.from(patientsMap.values());
    doctors = Array.from(doctorsMap.values());
    insurances = Array.from(insurancesMap.values());

    console.log("Extracted - Patients:", patients.length, "Doctors:", doctors.length, "Insurances:", insurances.length, "Appointments:", appointments.length);
  } else {
    // Parse Excel file
    console.log("Detected Excel format, parsing...");
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log("Importing sheets:", sheetNames);

    // simple helpers
    const toJson = (sheet) => xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // process patients sheet
    if (sheetNames.includes("patients")) {
      patients = toJson(workbook.Sheets["patients"]);
    }

    // process doctors sheet
    if (sheetNames.includes("doctors")) {
      doctors = toJson(workbook.Sheets["doctors"]);
    }

    // process insurances sheet
    if (sheetNames.includes("insurances")) {
      insurances = toJson(workbook.Sheets["insurances"]);
    }

    // process appointments sheet (optional)
    if (sheetNames.includes("appointments")) {
      appointments = toJson(workbook.Sheets["appointments"]);
    }
  }

  // Now process patients (from either CSV or Excel)
  console.log("Processing", patients.length, "patients...");
  for (const p of patients) {
    const { name, email, phone, address } = p;
    if (!email) continue; // skip invalid rows
    try {
      await pool.query(
        `INSERT INTO patients (name,email,phone,address)
         VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE name=name`,
        [name, email, phone, address]
      );
      console.log("Inserted patient:", email);
    } catch (err) {
      console.error("Error inserting patient", email, ":", err.message);
      throw err;
    }
    try {
      await PatientHistory.updateOne(
        { patientEmail: email },
        { $setOnInsert: { patientName: name, appointments: [] } },
        { upsert: true }
      );
      console.log("Upserted patient history:", email);
    } catch (err) {
      console.error("Error upserting patient history", email, ":", err.message);
      throw err;
    }
  }

  // Process doctors
  console.log("Processing", doctors.length, "doctors...");
  for (const d of doctors) {
    const { name, email, specialty } = d;
    if (!email) continue;
    try {
      await pool.query(
        `INSERT INTO doctors (name,email,specialty)
         VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE name=name`,
        [name, email, specialty]
      );
      console.log("Inserted doctor:", email);
    } catch (err) {
      console.error("Error inserting doctor", email, ":", err.message);
      throw err;
    }
  }

  // Process insurances
  console.log("Processing", insurances.length, "insurances...");
  for (const ins of insurances) {
    const { name, coverage_percentage } = ins;
    if (!name) continue;
    try {
      await pool.query(
        `INSERT INTO insurances (name,coverage_percentage)
         VALUES (?,?)
         ON DUPLICATE KEY UPDATE coverage_percentage=VALUES(coverage_percentage)`,
        [name, coverage_percentage || null]
      );
      console.log("Inserted insurance:", name);
    } catch (err) {
      console.error("Error inserting insurance", name, ":", err.message);
      throw err;
    }
  }

  // Process appointments
  console.log("Processing", appointments.length, "appointments...");
  for (const a of appointments) {
    const { appointmentId, patientEmail, doctorName, appointment_date, amount_paid, treatment_code, treatment_description, treatment_cost } = a;
    if (!patientEmail) continue;
    try {
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
        console.log("Inserted appointment:", appointmentId);
      }
    } catch (err) {
      console.error("Error inserting appointment", appointmentId, ":", err.message);
      throw err;
    }
    try {
      // update mongodb history without duplicating entries
      await PatientHistory.updateOne(
        { patientEmail },
        { $addToSet: { appointments: { appointmentId: appointmentId || null, doctorName, appointmentDate: appointment_date, treatmentDescription: treatment_description || null, amountPaid: amount_paid } } },
        { upsert: true }
      );
      console.log("Updated patient history for appointment:", appointmentId);
    } catch (err) {
      console.error("Error updating patient history", appointmentId, ":", err.message);
      throw err;
    }
  }

  return { message: "import completed" };
};
