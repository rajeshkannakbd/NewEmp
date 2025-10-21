import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SalaryPage() {
  const [employees, setEmployees] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    weekStart: "",
    weekEnd: "",
  });
  const [lastCalculatedId, setLastCalculatedId] = useState(null);

  // Load employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("https://newemployman.onrender.com/api/employees");
        const data = Array.isArray(res.data) ? res.data : res.data.employees;
        setEmployees(data || []);
      } catch (err) {
        console.error(
          "Error fetching employees:",
          err.response?.data || err.message
        );
      }
    };
    fetchEmployees();
  }, []);

  // Calculate salary
  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!form.employeeId) return alert("Please select an employee");
    if (!form.weekStart || !form.weekEnd)
      return alert("Please select week start and end");

    const payload = {
      employeeId: form.employeeId,
      weekStart: new Date(form.weekStart),
      weekEnd: new Date(form.weekEnd),
    };

    try {
      const res = await axios.post(
        "https://newemployman.onrender.com/api/salary/calculate",
        payload
      );
      alert(`Salary calculated: ${res.data.totalSalary}`);
      setLastCalculatedId(res.data._id); // highlight latest
      fetchSalaryHistory(form.employeeId);
    } catch (err) {
      console.error(
        "Salary calculation error:",
        err.response?.data || err.message
      );
      alert("Error calculating salary");
    }
  };

  // Fetch salary history
  const fetchSalaryHistory = async (employeeId) => {
    try {
      const res = await axios.get(
        `https://newemployman.onrender.com/api/salary/${employeeId}`
      );
      setSalaryData(res.data);
    } catch (err) {
      console.error(
        "Error fetching salary history:",
        err.response?.data || err.message
      );
    }
  };

  // Delete salary record
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      await axios.delete(`https://newemployman.onrender.com/api/salary/${id}`);
      setSalaryData(salaryData.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting salary:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Weekly Salary</h2>

        <form onSubmit={handleCalculate} className="space-y-3">
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.phone})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={form.weekStart}
              onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              value={form.weekEnd}
              onChange={(e) => setForm({ ...form, weekEnd: e.target.value })}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-semibold transition"
          >
            Calculate Salary
          </button>
        </form>
      </div>

      {/* Salary History Table */}
      <div className="max-w-3xl mx-auto mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3 text-center">
          Salary History
        </h3>
        <table className="min-w-full bg-white rounded-md shadow-md overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-2 text-left">Employee</th>
              <th className="p-2 text-left">Week Start</th>
              <th className="p-2 text-left">Week End</th>
              <th className="p-2 text-left">Total Shifts</th>
              <th className="p-2 text-left">Total Salary</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No salary records found
                </td>
              </tr>
            ) : (
              salaryData.map((s) => (
                <tr
                  key={s._id}
                  className={`border-b hover:bg-gray-50 ${
                    s._id === lastCalculatedId ? "bg-green-100" : ""
                  }`}
                >
                  <td className="p-2">{s.employeeId?.name}</td>
                  <td className="p-2">{new Date(s.weekStart).toLocaleDateString()}</td>
                  <td className="p-2">{new Date(s.weekEnd).toLocaleDateString()}</td>
                  <td className="p-2">{s.totalShifts}</td>
                  <td className="p-2">{s.totalSalary}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
