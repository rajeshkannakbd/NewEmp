const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Salary = require("../models/Salary");

// Calculate weekly salary
router.post("/calculate", async (req, res) => {
  try {
    const { employeeId, weekStart, weekEnd } = req.body;
    if (!employeeId || !weekStart || !weekEnd) return res.status(400).json({ error: "employeeId, weekStart, weekEnd required" });

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const start = new Date(new Date(weekStart).setHours(0,0,0,0));
    const end = new Date(new Date(weekEnd).setHours(23,59,59,999));

    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: start, $lte: end }
    });

    let totalShifts = 0;
    let totalAdvance = 0;
    attendanceRecords.forEach(r => {
      const s1 = (r.shift1 || "").toLowerCase().trim() === "present" ? 1 : 0;
      const s2 = (r.shift2 || "").toLowerCase().trim() === "present" ? 0.5 : 0;
      totalShifts += s1 + s2;
      totalAdvance += r.advance || 0;
    });

    const gross = totalShifts * emp.shiftRate;
    const net = gross - totalAdvance;

    const salary = new Salary({
      employeeId,
      weekStart: start,
      weekEnd: end,
      totalShifts,
      totalAdvance,
      totalSalary: net
    });

    await salary.save();
    res.json(salary);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Get salary history all
router.get("/", async (req, res) => {
  const list = await Salary.find().populate("employeeId", "name phone").sort({ weekStart: -1 });
  res.json(list);
});

// Get by employee
router.get("/:employeeId", async (req, res) => {
  const list = await Salary.find({ employeeId: req.params.employeeId }).populate("employeeId", "name phone").sort({ weekStart: -1 });
  res.json(list);
});

// Delete salary
router.delete("/:id", async (req, res) => {
  try {
    const del = await Salary.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
