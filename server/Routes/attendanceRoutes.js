const express = require("express");
const router = express.Router();
const Attendance = require("../Models/Attendance");
const { protect, managerOnly } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

router.post("/", protect, managerOnly, async (req, res) => {
  try {
    const { employeeId, date, siteId, shift1, shift2, advance, overtime } = req.body;

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
      existing.overtime = overtime || false;
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
      overtime: overtime || false,
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

router.get("/my", protect, async (req, res) => {
  const list = await Attendance.find({ employeeId: req.user.id });
  res.json(list);
});

router.get("/my-recent", protect, async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.user.id);

    const records = await Attendance.find({
      employeeId: employeeId,
    })
      .populate("siteId", "name")
      .sort({ date: -1 })
      .limit(7);

    res.json(records);

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
