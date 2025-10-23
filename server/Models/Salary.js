const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  weekStart: Date,
  weekEnd: Date,
  totalShifts: Number,
  totalAdvance: { type: Number, default: 0 },
  totalSalary: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Salary", salarySchema);
