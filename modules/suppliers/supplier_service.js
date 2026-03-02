const pool = require("../../config/mysql");
const Joi = require("joi");
const AuditLog = require("../../models/auditLog");


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

  // before deleting, ensure there are no transactions on any of this supplier's products
  const [txCount] = await pool.query(
    `SELECT COUNT(*) as cnt
       FROM transactions t
       JOIN products p ON t.product_sku = p.product_sku
       WHERE p.id_supplier = ?`,
    [id]
  );
  if (txCount[0].cnt > 0) {
    const err = new Error("Cannot delete supplier because there are transactions on its products");
    err.code = "FK_CONSTRAINT";
    throw err;
  }

  // cascade: remove products linked to this supplier first
  const [linkedProducts] = await pool.query(
    "SELECT * FROM products WHERE id_supplier = ?",
    [id]
  );
  if (linkedProducts.length > 0) {
    // log each product deletion
    for (const prod of linkedProducts) {
      try {
        await AuditLog.create({
          entity: "product",
          action: "delete",
          payload: prod,
        });
      } catch (logErr) {
        console.warn("Product audit failed:", logErr.message);
      }
    }
    // remove them from MySQL
    await pool.query("DELETE FROM products WHERE id_supplier = ?", [id]);
  }

  // audit supplier deletion
  try {
    await AuditLog.create({
      entity: "supplier",
      action: "delete",
      payload: old[0],
    });
  } catch (logErr) {
    console.warn("Audit log failed:", logErr.message);
  }

  try {
    await pool.query("DELETE FROM suppliers WHERE id_supplier = ?", [id]);
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
      const fkErr = new Error("Cannot delete supplier with associated products");
      fkErr.code = "FK_CONSTRAINT";
      throw fkErr;
    }
    throw err;
  }

  return { message: "supplier deleted", supplier: old[0] };
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
