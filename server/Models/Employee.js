const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, default: "" },
  type: { type: String, enum: ["Permanent", "Temporary"], default: "Permanent" },
  shiftRate: { type: Number, required: true }, // pay per full shift
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Active","Inactive"], default: "Active" },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site", default: null },
});

module.exports = mongoose.model("Employee", employeeSchema);
