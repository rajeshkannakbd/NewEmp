const express = require("express");
const router = express.Router();
const Attendance = require("../Models/Attendance");
const Employee = require("../Models/Employee");
const Salary = require("../Models/Salary");

// 📅 Calculate weekly salary
router.post("/calculate", async (req, res) => {
  try {
    const { employeeId, weekStart, weekEnd } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // 🗓️ Find attendance within date range
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: {
        $gte: new Date(new Date(weekStart).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(weekEnd).setHours(23, 59, 59, 999)),
      },
    });

    console.log("attendanceRecords found:", attendanceRecords);

    // 💰 Calculate total shifts (Shift1 = full rate, Shift2 = half rate)
    const totalShifts = attendanceRecords.reduce((sum, record) => {
      const shift1Present =
        record.shift1?.toLowerCase().trim() === "present" ? 1 : 0;
      const shift2Present =
        record.shift2?.toLowerCase().trim() === "present" ? 0.5 : 0;
      return sum + shift1Present + shift2Present;
    }, 0);

    // 💵 Calculate total salary
    const totalSalary = totalShifts * employee.shiftRate;

    // 🧾 Save the salary record
    const salary = new Salary({
      employeeId,
      weekStart,
      weekEnd,
      totalShifts,
      totalSalary,
    });

    await salary.save();
    res.json(salary);
    console.log("Salary saved:", salary);
  } catch (err) {
    console.error("Salary calculation error:", err);
    res.status(400).json({ error: err.message });
  }
});


// 👀 Get salary history (with employee info)
router.get("/", async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("employeeId", "name phone")
      .sort({ weekStart: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const salaries = await Salary.find({ employeeId })
      .populate("employeeId", "name phone")
      .sort({ weekStart: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Salary.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: "Salary record not found" });
    res.json({ message: "Salary record deleted successfully" });
  } catch (err) {
    console.error("Error deleting salary:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
