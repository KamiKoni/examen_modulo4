const AuditLog = require("../../models/auditLog");

exports.listLogs = async (filter = {}) => {
  return await AuditLog.find(filter).sort({ timestamp: -1 }).limit(100);
};
