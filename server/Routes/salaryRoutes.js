const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Attendance = require("../Models/Attendance");
const Employee = require("../Models/Employee");
const Salary = require("../Models/Salary");
const { protect } = require("../middleware/authMiddleware");

// ==============================
// CALCULATE WEEKLY SALARY
// ==============================
router.post("/calculate", async (req, res) => {
  try {
    console.log("---- SALARY CALCULATION START ----");
    console.log("Request Body:", req.body);

    const { employeeId, selectedDate } = req.body;

    if (!employeeId || !selectedDate) {
      console.log("Missing employeeId or selectedDate");
      return res.status(400).json({
        error: "employeeId and selectedDate required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      console.log("Invalid employeeId:", employeeId);
      return res.status(400).json({ error: "Invalid employeeId" });
    }

    const emp = await Employee.findById(employeeId);
    console.log("Employee Found:", emp);

    if (!emp) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("Shift Rate:", emp.shiftRate);

    const date = new Date(selectedDate);
    console.log("Selected Date:", date);

    if (isNaN(date)) {
      console.log("Invalid Date");
      return res.status(400).json({ error: "Invalid selectedDate" });
    }

    // Find week start (Sunday)
    const day = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);

    // Find week end (Saturday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    console.log("Week Start:", weekStart);
    console.log("Week End:", weekEnd);

    // Check duplicate salary
    const existingSalary = await Salary.findOne({
      employeeId,
      weekStart,
      weekEnd,
    });

    console.log("Existing Salary:", existingSalary);

    if (existingSalary) {
      return res.status(400).json({
        error: "Salary already calculated for this week",
      });
    }

    const attendanceRecords = await Attendance.find({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      date: { $gte: weekStart, $lte: weekEnd },
    });

    console.log("Attendance Records Found:", attendanceRecords.length);
    console.log("Attendance Data:", attendanceRecords);

    let totalShifts = 0;
    let totalAdvance = 0;
    let overtimePay = 0;

    attendanceRecords.forEach((r) => {
      console.log("Processing attendance:", r);

      const s1 =
        r.shift1?.toLowerCase() === "present" ? 1 : 0;

      const s2 =
        r.shift2?.toLowerCase() === "present" ? 0.5 : 0;

      totalShifts += s1 + s2;

      if (r.overtime === true) {
        overtimePay += Number(emp.shiftRate) / 2;
      }

      totalAdvance += Number(r.advance) || 0;
    });

    console.log("Total Shifts:", totalShifts);
    console.log("Overtime Pay:", overtimePay);
    console.log("Total Advance:", totalAdvance);

    const grossSalary =
      totalShifts * Number(emp.shiftRate) + overtimePay;

    const netSalary = grossSalary - totalAdvance;

    console.log("Gross Salary:", grossSalary);
    console.log("Net Salary:", netSalary);

    const salary = new Salary({
      employeeId,
      weekStart,
      weekEnd,
      totalShifts,
      overtimePay,
      grossSalary,
      totalAdvance,
      totalSalary: netSalary,
    });

    await salary.save();

    console.log("Saved Salary:", salary);
    console.log("---- SALARY CALCULATION END ----");

    res.status(201).json({
      message: "Salary calculated successfully",
      salary,
    });

  } catch (err) {
    console.error("Salary Calculation Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// GET ALL SALARY
// ==============================
router.get("/", async (req, res) => {
  try {
    const list = await Salary.find()
      .populate("employeeId", "name phone")
      .sort({ weekStart: -1 });

    console.log("Salary List:", list);

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// DELETE SALARY
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    console.log("Deleting salary ID:", req.params.id);

    const deleted = await Salary.findByIdAndDelete(req.params.id);

    console.log("Deleted:", deleted);

    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;