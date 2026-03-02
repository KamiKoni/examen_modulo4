const Customer = require("../../models/customer");

// CREATE
exports.createcustomer = async (body) => {
  if (!body.name || !body.email) throw new Error("Missing required fields: name and email");
  const customer = new Customer(body);
  await customer.save();
  return { message: "customer created", customer };
};

// UPDATE
exports.updatecustomer = async (id, body) => {
  const updated = await Customer.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return null;
  return { message: "customer updated", customer: updated };
};

// DELETE
exports.deletecustomer = async (id) => {
  const deleted = await Customer.findByIdAndDelete(id);
  if (!deleted) return null;
  return { message: "customer deleted" };
};

// READ
exports.getcustomers = async (search, address) => {
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } }
    ];
  } else if (address) {
    filter.address = address;
  }
  return await Customer.find(filter);
};

exports.getcustomerById = async (id) => {
  return await Customer.findById(id);
};