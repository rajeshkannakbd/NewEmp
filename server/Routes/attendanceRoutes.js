const express = require("express");
const router = express.Router();
const Attendance = require("../Models/Attendance");

// ➕ Mark or update attendance
router.post("/", async (req, res) => {
  try {
    const { employeeId, date, shift1, shift2 } = req.body;

    const record = await Attendance.findOneAndUpdate(
      { employeeId, date },
      { shift1, shift2 },
      { new: true, upsert: true }
    );

    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// 👀 Get attendance by employee
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find();
    res.json(records);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
