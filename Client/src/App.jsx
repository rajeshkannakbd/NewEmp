import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import EmployeePage from "./Pages/EmployeePage";
import AttendancePage from "./Pages/AttendancePage";
import SalaryPage from "./Pages/SalaryPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-xl md:text-2xl font-bold text-center">
            Two-Shift Attendance & Salary System
          </h1>
          {/* Navigation */}
          <nav className="mt-2 flex flex-col md:flex-row justify-center gap-2 md:gap-4 text-sm md:text-base">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-yellow-200"
              }
            >
              Employees
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-yellow-200"
              }
            >
              Attendance
            </NavLink>
            <NavLink
              to="/salary"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-yellow-200"
              }
            >
              Salary
            </NavLink>
          </nav>
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<EmployeePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/salary" element={<SalaryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
