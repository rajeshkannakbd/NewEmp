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
    // console.log(employee);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // find attendance records in that week
    // const attendanceRecords = await Attendance.find({
    //   employeeId,
    //   date: { $gte: new Date(weekStart), $lte: new Date(weekEnd) },
    // });

    // // count "Present" shifts (case-insensitive)
    // const totalShifts = attendanceRecords.reduce((sum, record) => {
    //   const shift1Present = record.shift1?.toLowerCase() === "present" ? 1 : 0;
    //   const shift2Present = record.shift2?.toLowerCase() === "present" ? 1 : 0;
    //   return sum + shift1Present + shift2Present;
    // }, 0);
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: {
        $gte: new Date(new Date(weekStart).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(weekEnd).setHours(23, 59, 59, 999)),
      },
    });
     
    console.log("attendanceRecords found:", attendanceRecords);

    const totalShifts = attendanceRecords.reduce((sum, record) => {
      const shift1Present =
        record.shift1?.toLowerCase().trim() === "present" ? 1 : 0;
      const shift2Present =
        record.shift2?.toLowerCase().trim() === "present" ? 1 : 0;
      return sum + shift1Present + shift2Present;
    }, 0);

    console.log(totalShifts);

    const totalSalary = totalShifts * employee.shiftRate;
    console.log(totalSalary);
    const salary = new Salary({
      employeeId,
      weekStart,
      weekEnd,
      totalShifts,
      totalSalary,
    });

    await salary.save();
    res.json(salary);
    console.log(salary);
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
