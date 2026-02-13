import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { API_URL } from "../config";
import { ThreeDots } from "react-loader-spinner";

export default function MyDashboard() {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ added

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); // ✅ start loading

        const empRes = await axios.get(`${API_URL}/auth/me`);
        setEmployee(empRes.data);

        const attRes = await axios.get(`${API_URL}/attendance/my-recent`);
        setAttendance(attRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // ✅ stop loading
      }
    };

    load();
  }, []);

  /* -------- Salary Calculation -------- */
  const totalShifts = attendance.reduce((total, r) => {
    const s1 = r.shift1 === "Present" ? 1 : 0;
    const s2 = r.shift2 === "Present" ? 0.5 : 0;
    return total + s1 + s2;
  }, 0);

  const overtimePay = attendance.reduce((total, r) => {
    if (r.overtime && employee) {
      return total + employee.shiftRate / 2;
    }
    return total;
  }, 0);

  const totalAdvance = attendance.reduce(
    (total, r) => total + (r.advance || 0),
    0,
  );

  const gross = employee
    ? totalShifts * employee.shiftRate + overtimePay
    : 0;

  const net = gross - totalAdvance;

  // ✅ Show Loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ThreeDots color="#2563eb" height={60} width={80} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Employee Details */}
      {employee && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">My Details</h2>
          <div><strong>Name:</strong> {employee.name}</div>
          <div><strong>Phone:</strong> {employee.phone}</div>
          <div><strong>Role:</strong> {employee.role}</div>
          <div><strong>Shift Rate:</strong> ₹{employee.shiftRate}</div>
          <div><strong>Status:</strong> {employee.status}</div>
        </div>
      )}

      {/* Attendance List */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3 text-lg">Last 7 Working Days</h3>

        {attendance.length === 0 ? (
          <div className="text-gray-500">No attendance records found.</div>
        ) : (
          attendance.map((a) => (
            <div key={a._id} className="border p-3 mb-2 rounded bg-gray-50">
              <div className="font-semibold">
                {new Date(a.date).toLocaleDateString()}
              </div>

              <div>Site: {a.siteId?.name || "N/A"}</div>
              <div>Shift 1: {a.shift1}</div>
              <div>Shift 2: {a.shift2}</div>
              <div>Advance: ₹{a.advance || 0}</div>
              <div>Overtime: {a.overtime ? "Yes" : "No"}</div>
            </div>
          ))
        )}
      </div>

      {/* Salary Summary */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2 text-lg">Recent Earnings Summary</h3>

        <div>Total Shifts: {totalShifts}</div>
        <div>Overtime Pay: ₹{overtimePay}</div>
        <div>Total Advance: ₹{totalAdvance}</div>
        <div>Gross Salary: ₹{gross}</div>

        <div className="font-bold text-xl mt-2 text-green-600">
          Net Salary: ₹{net}
        </div>
      </div>
    </div>
  );
}
