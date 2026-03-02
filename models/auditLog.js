const mongoose = require("../config/mongo");
const { Schema } = require("mongoose");

const auditSchema = new Schema({
  entity: { type: String, required: true },
  action: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", auditSchema);