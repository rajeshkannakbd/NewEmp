const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  status: { type: String, enum: ["Active", "Completed"], default: "Active" },
  startDate: { type: Date, default: Date.now },
});

// ✅ Prevent OverwriteModelError
module.exports =
  mongoose.models.Site ||
  mongoose.model("Site", siteSchema);
