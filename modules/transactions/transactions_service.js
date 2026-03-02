const pool = require("../../config/mysql");
const Joi = require("joi");

// Validation schema for a stock transaction
const transactionSchema = Joi.object({
  product_sku: Joi.string().required(),
  id_customer: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  date: Joi.date().iso().required(),
});

// GET ALL / SEARCH
exports.gettransactions = async (search) => {
  let query = `SELECT t.id_transaction,
                      t.product_sku,
                      t.quantity,
                      t.id_customer,
                      t.date,
                      c.customer_name,
                      p.product_name
               FROM transactions t
               LEFT JOIN customers c ON t.id_customer = c.id_customer
               LEFT JOIN products p ON t.product_sku = p.product_sku`;
  const params = [];
  if (search) {
    query += " WHERE c.customer_name LIKE ? OR p.product_name LIKE ? OR t.product_sku LIKE ?";
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

exports.getTransactionById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM transactions WHERE id_transaction = ?", [id]);
  return rows[0];
};

// CREATE
exports.createtransaction = async (body) => {
  const { error } = transactionSchema.validate(body);
  if (error) throw error;

  const { product_sku, id_customer, quantity, date } = body;
  await pool.query(
    `INSERT INTO transactions (product_sku,id_customer,quantity,date)
     VALUES (?,?,?,?)`,
    [product_sku, id_customer, quantity, date]
  );

  return { message: "transaction created" };
};

// UPDATE
exports.updatetransaction = async (id, body) => {
  const { error } = transactionSchema.validate(body);
  if (error) throw error;

  const { product_sku, id_customer, quantity, date } = body;
  const [result] = await pool.query(
    `UPDATE transactions SET product_sku=?, id_customer=?, quantity=?, date=? WHERE id_transaction=?`,
    [product_sku, id_customer, quantity, date, id]
  );

  if (result.affectedRows === 0) return null;
  return { message: "transaction updated" };
};

// DELETE
exports.deletetransaction = async (id) => {
  const [old] = await pool.query("SELECT * FROM transactions WHERE id_transaction = ?", [id]);
  if (!old[0]) return null;
  await pool.query("DELETE FROM transactions WHERE id_transaction = ?", [id]);
  return { message: "transaction deleted" };
};
