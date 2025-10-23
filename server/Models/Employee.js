const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, default: "" },
  type: { type: String, enum: ["Permanent", "Temporary"], default: "Permanent" },
  shiftRate: { type: Number, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site", default: null },
});

// ✅ Prevent OverwriteModelError
module.exports =
  mongoose.models.Employee ||
  mongoose.model("Employee", employeeSchema);
