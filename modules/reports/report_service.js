const pool = require("../../config/mysql");
const Joi = require("joi");

// Validation for date range
const dateSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

exports.getRevenueReport = async (startDate, endDate) => {
  const { error } = dateSchema.validate({ startDate, endDate });
  if (error) throw error;

  const params = [];
  let dateFilter = "";

  if (startDate && endDate) {
    dateFilter = "WHERE appointment_date BETWEEN ? AND ?";
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = "WHERE appointment_date >= ?";
    params.push(startDate);
  } else if (endDate) {
    dateFilter = "WHERE appointment_date <= ?";
    params.push(endDate);
  }

  // Total Revenue
  const [totalRows] = await pool.query(
    `SELECT SUM(amount_paid) as totalRevenue FROM appointments ${dateFilter}`,
    params
  );

  // Total by insurance
  const [insuranceRows] = await pool.query(
    `SELECT i.name as insurance, SUM(a.amount_paid) as total 
     FROM appointments a
     LEFT JOIN insurances i ON a.insurance_id = i.id
     ${dateFilter ? dateFilter.replace("appointment_date", "a.appointment_date") : ""}
     GROUP BY i.name`,
    params
  );

  return {
    totalRevenue: totalRows[0].totalRevenue || 0,
    totalByInsurance: insuranceRows,
    dateRange: { startDate: startDate || null, endDate: endDate || null },
  };
};