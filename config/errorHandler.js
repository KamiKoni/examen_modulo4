module.exports = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({ message: err.details[0].message });
  }

  // Custom thrown errors
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }

  // Fallback for unexpected errors
  res.status(500).json({ message: "Internal Server Error" });
};
exports.createPatient = async (req, res, next) => {
  try {
    const data = await service.createPatient(req.body);
    res.json(data);
  } catch (err) {
    next(err); // Pass error to centralized middleware
  }
};