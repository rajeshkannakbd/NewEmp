const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const employeesRouter = require("./Routes/employeeRoutes");
const sitesRouter = require("./Routes/siteRoute");
const attendanceRouter = require("./Routes/attendanceRoutes");
const salaryRouter = require("./Routes/salaryRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/empdb";
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("Mongo connection error:", err));

// API routes
app.use("/api/employees", employeesRouter);
app.use("/api/sites", sitesRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/salary", salaryRouter);

// Serve React build
const __dirname1 = path.resolve();
app.use(express.static(path.join(__dirname1, "/client/build")));

// ✅ Catch-all for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname1, "/client/build", "index.html"));
});

// Simple health check
app.get("/health", (req, res) => res.send("Employee management API is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
