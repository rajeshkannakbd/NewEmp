const express = require("express");
const router = express.Router();
const Employee = require("../Models/Employee");

// ➕ Add new employee
router.post("/", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👀 Get all employees
router.get("/", async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      req.body,           // Can update name, phone, role, shiftRate
      { new: true }       // Return the updated document
    );
    if (!updatedEmployee)
      return res.status(404).json({ error: "Employee not found" });

    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
