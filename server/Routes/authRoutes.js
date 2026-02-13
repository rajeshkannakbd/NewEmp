const express = require("express");
const Employee = require("../Models/Employee");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const user = await Employee.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id, accessRole: user.accessRole || "Worker" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      accessRole: user.accessRole || "Worker",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await Employee.findById(req.user.id).populate(
      "siteId",
      "name",
    );

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
