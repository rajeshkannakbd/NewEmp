const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },
  shift1: { type: String, default: "Absent" }, // Present / Absent / Leave
  shift2: { type: String, default: "Absent" },
  advance: { type: Number, default: 0 }
});

// ensure unique per employee + date + site
attendanceSchema.index({ employeeId: 1, date: 1, siteId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
