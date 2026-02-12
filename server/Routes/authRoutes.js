const express = require("express");
const Employee = require("../Models/Employee");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await Employee.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id, accessRole: user.accessRole },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      accessRole: user.accessRole,
      jobRole: user.role, // this is fitter/helper
      name: user.name,
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await Employee.findById(req.user.id).populate("siteId", "name");

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
