const pool = require("../../config/mysql");
const Joi = require("joi");

const productSchema = Joi.object({
  product_sku: Joi.string().pattern(/^[A-Za-z0-9\-]+$/).min(1).max(50).required(), // allow letters, digits and hyphens
  id_supplier: Joi.number().integer().required(),
  product_name: Joi.string().max(255).allow(null, ""),
  product_category: Joi.string().max(100).allow(null, ""),
  unit_price: Joi.number().precision(2).min(0).allow(null)
});

exports.createProduct = async (body) => {
  const { error } = productSchema.validate(body);
  if (error) throw error;

  const { product_sku, id_supplier, product_name, product_category, unit_price } = body;
  await pool.query(
    `INSERT INTO products (product_sku,id_supplier,product_name,product_category,unit_price)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE id_supplier=VALUES(id_supplier), product_name=VALUES(product_name), product_category=VALUES(product_category), unit_price=VALUES(unit_price)`,
    [product_sku, id_supplier, product_name || null, product_category || null, unit_price]
  );

  return { message: "product created or updated" };
};

exports.updateProduct = async (sku, body) => {
  const { error } = productSchema.validate({ ...body, product_sku: sku });
  if (error) throw error;

  const { id_supplier, product_name, product_category, unit_price } = body;
  const [old] = await pool.query("SELECT * FROM products WHERE product_sku = ?", [sku]);
  if (!old[0]) return null;

  await pool.query(
    `UPDATE products SET id_supplier=?, product_name=?, product_category=?, unit_price=? WHERE product_sku=?`,
    [id_supplier, product_name || null, product_category || null, unit_price, sku]
  );

  return { message: "product updated" };
};

const AuditLog = require("../../models/auditLog");

exports.deleteProduct = async (sku) => {
  const [old] = await pool.query("SELECT * FROM products WHERE product_sku = ?", [sku]);
  if (!old[0]) return null;

  // check for associated transactions
  const [related] = await pool.query(
    "SELECT COUNT(*) as cnt FROM transactions WHERE product_sku = ?",
    [sku]
  );
  if (related[0].cnt > 0) {
    const err = new Error("Cannot delete product with associated transactions");
    err.code = "FK_CONSTRAINT";
    throw err;
  }

  // audit
  try {
    await AuditLog.create({
      entity: "product",
      action: "delete",
      payload: old[0],
    });
  } catch (logErr) {
    console.warn("Audit log failed:", logErr.message);
  }

  await pool.query("DELETE FROM products WHERE product_sku = ?", [sku]);
  return { message: "product deleted", product: old[0] };
};

exports.getProducts = async (search) => {
  let query = "SELECT * FROM products";
  const params = [];
  if (search) {
    query += " WHERE product_name LIKE ? OR product_sku LIKE ?";
    const term = `%${search}%`;
    params.push(term, term);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

exports.getProductBySku = async (sku) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE product_sku = ?", [sku]);
  return rows[0];
};
