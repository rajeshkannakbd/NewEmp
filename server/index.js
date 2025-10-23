const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Routers
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

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Serve React static files (for production)
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../client/build");
  app.use(express.static(clientBuildPath));

  // Catch-all route to serve index.html for React Router
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
