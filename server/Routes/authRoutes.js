const express = require("express");
const Employee = require("../Models/Employee");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { protect } = require("../middleware/authMiddleware");

/* -------- LOGIN -------- */

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const formattedPhone = phone.trim();

    const user = await Employee.findOne({ phone: formattedPhone });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /* ---------------- MANAGER LOGIN ---------------- */
    if (user.accessRole === "Manager") {

      // If password not provided → tell frontend to show password field
      if (!password) {
        return res.json({
          isManager: true,
          message: "Password required",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password || "");

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }
    }

    /* ---------------- WORKER LOGIN ---------------- */
    // Worker doesn't need password

    const token = jwt.sign(
      { id: user._id, accessRole: user.accessRole },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      accessRole: user.accessRole,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



/* ---------------- GET PROFILE ---------------- */

router.get("/me", protect, async (req, res) => {
  try {
    const user = await Employee.findById(req.user.id).populate("siteId", "name");
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/set-manager-password", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await Employee.findOne({ phone });

    if (!user || user.accessRole !== "Manager") {
      return res.status(400).json({ error: "Manager not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({ message: "Password set successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
