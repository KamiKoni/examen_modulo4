const pool = require("../../config/mysql");
const Joi = require("joi");

// Validation schema
const customerSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required(),
  customer_email: Joi.string().email().required(),
  customer_direction: Joi.string().min(2).max(100).required(),
});

// CREATE
exports.createcustomer = async (body) => {
  const { error } = customerSchema.validate(body);
  if (error) throw error;

  const { customer_name, customer_email, customer_direction } = body;
  await pool.query(
    `INSERT INTO customers (customer_name, customer_email,customer_direction)
     VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE customer_name=customer_name`,
    [customer_name, customer_email, customer_direction]
  );

  return { message: "customer created or already exists" };
};

// UPDATE
exports.updatecustomer = async (id, body) => {
  const { error } = customerSchema.validate(body);
  if (error) throw error;

  const { customer_name, customer_direction } = body;

  const [old] = await pool.query("SELECT * FROM customers WHERE id = ?", [id]);
  if (!old[0]) return null;

  const oldcustomer_name = old[0].customer_name;

  await pool.query(
    `UPDATE customers SET customer_name=?, customer_direction=? WHERE id=?`,
    [customer_name, customer_direction, id]
  );


  return { message: "customer updated" };
};

// DELETE
exports.deletecustomer = async (id) => {
  const [old] = await pool.query("SELECT * FROM customers WHERE id = ?", [id]);
  if (!old[0]) return null;

  const customerName = old[0].customer_name;

  await pool.query("DELETE FROM customers WHERE id = ?", [id]);



  return { message: "customer deleted" };
};

// READ
exports.getcustomers = async (search, customer_direction) => {
  let query = "SELECT * FROM customers";
  const params = [];

  if (search) {
    query += " WHERE name LIKE ? OR customer_email LIKE ? OR customer_direction LIKE ?";
    const term = `%${search}%`;
    params.push(term, term, term);
  } else if (customer_direction) {
    query += " WHERE customer_direction = ?";
    params.push(customer_direction);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

exports.getcustomerById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [id]);
  return rows[0];
};