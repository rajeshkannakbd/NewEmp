const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  shift1: { type: String, enum: ["Present", "Absent", "Leave"], default: "Absent" },
  shift2: { type: String, enum: ["Present", "Absent", "Leave"], default: "Absent" },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
