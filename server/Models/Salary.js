const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  weekStart: Date,
  weekEnd: Date,
  totalShifts: Number,
  totalSalary: Number,
  generatedOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Salary", salarySchema);
