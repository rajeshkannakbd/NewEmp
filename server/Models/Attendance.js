const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },
  shift1: { type: String, default: "Absent" },
  shift2: { type: String, default: "Absent" },
  advance: { type: Number, default: 0 },
  overtime: { type: Boolean, default: false },
});

// Ensure unique per employee + date + site
attendanceSchema.index({ employeeId: 1, date: 1, siteId: 1 }, { unique: true });

// ✅ Prevent OverwriteModelError
module.exports =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
