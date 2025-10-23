const express = require("express");
const router = express.Router();
const Site = require("../Models/Site");

// ➕ Add new site
router.post("/", async (req, res) => {
  try {
    const site = new Site(req.body);
    await site.save();
    res.status(201).json(site);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👀 Get all sites
router.get("/", async (req, res) => {
  try {
    const sites = await Site.find().sort({ startDate: -1 });
    res.json(sites);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete site
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Site.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Site not found" });
    res.json({ message: "Site deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
