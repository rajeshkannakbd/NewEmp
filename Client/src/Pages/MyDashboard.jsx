import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { API_URL } from "../config";
import { ThreeDots } from "react-loader-spinner";

export default function MyDashboard() {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const empRes = await axios.get(`${API_URL}/auth/me`);
        setEmployee(empRes.data);

        const attRes = await axios.get(`${API_URL}/attendance/my-recent`);
        setAttendance(attRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* -------- Weekly Filter (Sunday → Saturday) -------- */

  const today = new Date();
  const day = today.getDay(); // 0 = Sunday

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Build full 7 days of week
  const fullWeek = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);

    const found = attendance.find(
      (a) => new Date(a.date).toDateString() === d.toDateString()
    );

    fullWeek.push({
      date: d,
      shift1: found?.shift1 || "Absent",
      shift2: found?.shift2 || "Absent",
      advance: found?.advance || 0,
      overtime: found?.overtime || false,
      siteId: found?.siteId || null,
    });
  }

  /* -------- Salary Calculation -------- */

  const totalShifts = fullWeek.reduce((total, r) => {
    const s1 = r.shift1 === "Present" ? 1 : 0;
    const s2 = r.shift2 === "Present" ? 0.5 : 0;
    return total + s1 + s2;
  }, 0);

  const overtimePay = fullWeek.reduce((total, r) => {
    if (r.overtime && employee) {
      return total + employee.shiftRate / 2;
    }
    return total;
  }, 0);

  const totalAdvance = fullWeek.reduce(
    (total, r) => total + (r.advance || 0),
    0
  );

  const gross = employee
    ? totalShifts * employee.shiftRate + overtimePay
    : 0;

  const net = gross - totalAdvance;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDots color="#2563eb" height={60} width={80} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">

      {/* 💰 Earnings Summary */}
      <div className="bg-white p-5 rounded-2xl shadow-md">
        <h3 className="font-bold text-lg mb-2 text-gray-800">
          Weekly Earnings
        </h3>

        <p className="text-xs text-gray-500 mb-4">
          {weekStart.toLocaleDateString("en-GB")} - {weekEnd.toLocaleDateString("en-GB")}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total Shifts</p>
            <p className="font-semibold">{totalShifts}</p>
          </div>

          <div>
            <p className="text-gray-500">Overtime Pay</p>
            <p className="font-semibold">₹{overtimePay}</p>
          </div>

          <div>
            <p className="text-gray-500">Advance</p>
            <p className="font-semibold">₹{totalAdvance}</p>
          </div>

          <div>
            <p className="text-gray-500">Gross Salary</p>
            <p className="font-semibold">₹{gross}</p>
          </div>
        </div>

        <div className="mt-5 text-2xl font-bold text-green-600 border-t pt-3">
          Net Salary: ₹{net}
        </div>
      </div>

      {/* 👤 Employee Details */}
      {employee && (
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Employee Details
          </h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-semibold">{employee.name}</p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-semibold">{employee.phone}</p>
            </div>

            <div>
              <p className="text-gray-500">Role</p>
              <p className="font-semibold">{employee.role}</p>
            </div>

            <div>
              <p className="text-gray-500">Shift Rate</p>
              <p className="font-semibold">₹{employee.shiftRate}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-semibold">{employee.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* 📅 Attendance */}
      <div className="bg-white p-5 rounded-2xl shadow-md">
        <h3 className="font-bold text-lg mb-4 text-gray-800">
          This Week Attendance
        </h3>

        {fullWeek.map((a, index) => (
          <div
            key={index}
            className="border rounded-xl p-4 mb-3 bg-gray-50"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">
                {a.date.toLocaleDateString("en-GB")}
              </span>

              {a.overtime && (
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                  Overtime
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Shift 1:</span>{" "}
                <span
                  className={`font-semibold ${
                    a.shift1 === "Present"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {a.shift1}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Shift 2:</span>{" "}
                <span
                  className={`font-semibold ${
                    a.shift2 === "Present"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {a.shift2}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Advance:</span>{" "}
                ₹{a.advance}
              </div>

              <div>
                <span className="text-gray-500">Site:</span>{" "}
                {a.siteId?.name || "N/A"}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
