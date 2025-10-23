const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Create
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Employee POST:", req.body); // 👈 Add this
    const emp = new Employee(req.body);
    await emp.save();
    res.status(201).json(emp);
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(400).json({ error: err.message });
  }
});
// Read all
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().populate("siteId", "name"); // 👈 populates site name only
    res.json(employees);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const del = await Employee.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
