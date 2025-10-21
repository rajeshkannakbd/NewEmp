import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    shift1: "Absent",
    shift2: "Absent",
  });
  const [records, setRecords] = useState([]);

  // Fetch all employees
  useEffect(() => {
    axios.get("http://localhost:3000/api/employees")
      .then(res => setEmployees(res.data))
      .catch(err => console.error("Error loading employees:", err.message));
  }, []);

  // Fetch attendance records when date changes
  useEffect(() => {
    if (attendance.date) fetchRecordsForDate(attendance.date);
  }, [attendance.date]);

  const fetchRecordsForDate = async (date) => {
    try {
      const res = await axios.get("http://localhost:3000/api/attendance");
      const filtered = res.data.filter(
        rec => new Date(rec.date).toISOString().split("T")[0] === date
      );
      setRecords(filtered);
    } catch (err) {
      console.error("Error fetching attendance records:", err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/attendance", attendance);
      alert("✅ Attendance saved!");
      fetchRecordsForDate(attendance.date);
    } catch (err) {
      console.error("Error saving attendance:", err.message);
      alert("Error saving attendance");
    }
  };

  const moveDate = (days) => {
    const newDate = new Date(attendance.date);
    newDate.setDate(newDate.getDate() + days);
    setAttendance({ ...attendance, date: newDate.toISOString().split("T")[0] });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Attendance Management</h2>

        {/* Date Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => moveDate(-1)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            ⬅️ Prev
          </button>
          <input
            type="date"
            value={attendance.date}
            onChange={(e) => setAttendance({ ...attendance, date: e.target.value })}
            className="border rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => moveDate(1)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Next ➡️
          </button>
        </div>

        {/* Mark Attendance Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            value={attendance.employeeId}
            onChange={(e) => setAttendance({ ...attendance, employeeId: e.target.value })}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.phone})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">Shift 1</label>
              <select
                value={attendance.shift1}
                onChange={(e) => setAttendance({ ...attendance, shift1: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option>Present</option>
                <option>Absent</option>
                <option>Leave</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">Shift 2</label>
              <select
                value={attendance.shift2}
                onChange={(e) => setAttendance({ ...attendance, shift2: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option>Present</option>
                <option>Absent</option>
                <option>Leave</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-semibold transition"
          >
            Save Attendance
          </button>
        </form>
      </div>

      {/* Attendance Table */}
      <div className="max-w-2xl mx-auto mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3 text-center">
          Attendance Records for {attendance.date}
        </h3>
        <table className="min-w-full bg-white rounded-md shadow-md overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-2 text-left">Employee</th>
              <th className="p-2 text-left">Shift 1</th>
              <th className="p-2 text-left">Shift 2</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              records.map(rec => (
                <tr key={rec._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{employees.find(e => e._id === rec.employeeId)?.name || "Unknown"}</td>
                  <td className="p-2">{rec.shift1}</td>
                  <td className="p-2">{rec.shift2}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
