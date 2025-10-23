const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

router.post("/", async (req, res) => {
  try {
    const { employeeId, date, siteId, shift1, shift2, advance } = req.body;

    // Normalize date to midnight UTC (so it's always same day)
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Look for record only by employee + same day (regardless of time)
    const existing = await Attendance.findOne({
      employeeId,
      date: normalizedDate,
    });

    if (existing) {
      existing.siteId = siteId;
      existing.shift1 = shift1;
      existing.shift2 = shift2;
      existing.advance = advance;
      await existing.save();
      return res.json(existing);
    }

    const newRecord = new Attendance({
      employeeId,
      date: normalizedDate,
      siteId,
      shift1,
      shift2,
      advance,
    });
    await newRecord.save();
    res.json(newRecord);
  } catch (err) {
    console.error("Attendance save error:", err);
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const list = await Attendance.find();
  res.json(list);
});

module.exports = router;
