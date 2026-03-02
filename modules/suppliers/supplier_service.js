const pool = require("../../config/mysql");
const Joi = require("joi");

const supplierSchema = Joi.object({
  supplier_name: Joi.string().min(2).max(100).required(),
  supplier_email: Joi.string().email().allow(null, "")
});

exports.createSupplier = async (body) => {
  const { error } = supplierSchema.validate(body);
  if (error) throw error;

  const { supplier_name, supplier_email } = body;
  await pool.query(
    `INSERT INTO suppliers (supplier_name,supplier_email)
     VALUES (?,?)
     ON DUPLICATE KEY UPDATE supplier_name=VALUES(supplier_name), supplier_email=VALUES(supplier_email)`,
    [supplier_name, supplier_email || null]
  );

  return { message: "supplier created or already exists" };
};

exports.updateSupplier = async (id, body) => {
  const { error } = supplierSchema.validate(body);
  if (error) throw error;

  const { supplier_name, supplier_email } = body;
  const [old] = await pool.query("SELECT * FROM suppliers WHERE id_supplier = ?", [id]);
  if (!old[0]) return null;

  await pool.query(
    `UPDATE suppliers SET supplier_name=?, supplier_email=? WHERE id_supplier=?`,
    [supplier_name, supplier_email || null, id]
  );

  return { message: "supplier updated" };
};

exports.deleteSupplier = async (id) => {
  const [old] = await pool.query("SELECT * FROM suppliers WHERE id_supplier = ?", [id]);
  if (!old[0]) return null;

  await pool.query("DELETE FROM suppliers WHERE id_supplier = ?", [id]);
  return { message: "supplier deleted" };
};

exports.getSuppliers = async (search) => {
  let query = "SELECT * FROM suppliers";
  const params = [];
  if (search) {
    query += " WHERE supplier_name LIKE ? OR supplier_email LIKE ?";
    const term = `%${search}%`;
    params.push(term, term);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

exports.getSupplierById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM suppliers WHERE id_supplier = ?", [id]);
  return rows[0];
};
