import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThreeDot } from "react-loading-indicators"; // Make sure this package is installed

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    shift1: "Absent",
    shift2: "Absent",
  });
  const [records, setRecords] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await axios.get("https://newemployman.onrender.com/api/employees");
        setEmployees(res.data);
      } catch (err) {
        console.error("Error loading employees:", err.message);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch attendance records when date changes
  useEffect(() => {
    if (attendance.date && employees.length > 0) {
      fetchRecordsForDate(attendance.date);
    }
  }, [attendance.date, employees]);

  const fetchRecordsForDate = async (date) => {
    if (employees.length === 0) return;

    setLoadingRecords(true);
    try {
      const res = await axios.get("https://newemployman.onrender.com/api/attendance");
      const filtered = res.data.filter(
        (rec) => new Date(rec.date).toISOString().split("T")[0] === date
      );

      const merged = employees.map((emp) => {
        const record = filtered.find((r) => r.employeeId === emp._id);
        return {
          employeeId: emp._id,
          name: emp.name,
          shift1: record ? record.shift1 : "Absent",
          shift2: record ? record.shift2 : "Absent",
        };
      });

      setRecords(merged);
    } catch (err) {
      console.error("Error fetching attendance records:", err.message);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post("https://newemployman.onrender.com/api/attendance", attendance);
      alert("✅ Attendance saved!");
      fetchRecordsForDate(attendance.date);
    } catch (err) {
      console.error("Error saving attendance:", err.message);
      alert("Error saving attendance");
    } finally {
      setSaving(false);
    }
  };

  const moveDate = (days) => {
    const newDate = new Date(attendance.date);
    newDate.setDate(newDate.getDate() + days);
    setAttendance({ ...attendance, date: newDate.toISOString().split("T")[0] });
  };

  const toggleShift = async (employeeId, shift) => {
    const rec = records.find((r) => r.employeeId === employeeId);
    if (!rec) return;

    const next = rec[shift] === "Present" ? "Absent" : "Present";
    if (!window.confirm(`Are you sure you want to change ${shift} for ${rec.name} to ${next}?`))
      return;

    setSaving(true);
    try {
      await axios.post("https://newemployman.onrender.com/api/attendance", {
        employeeId,
        date: attendance.date,
        shift1: shift === "shift1" ? next : rec.shift1,
        shift2: shift === "shift2" ? next : rec.shift2,
      });

      setRecords((prev) =>
        prev.map((r) => (r.employeeId === employeeId ? { ...r, [shift]: next } : r))
      );
    } catch (err) {
      console.error("Error updating attendance:", err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Attendance Records", 14, 22);

    const tableColumn = ["Employee", "Shift 1", "Shift 2"];
    const tableRows = records.map((rec) => [rec.name, rec.shift1, rec.shift2]);

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save(`Attendance_${attendance.date}.pdf`);
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
        {loadingEmployees ? (
          <div className="flex justify-center my-4">
            <ThreeDot color="#3196cc" size="medium" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <select
              value={attendance.employeeId}
              onChange={(e) =>
                setAttendance({ ...attendance, employeeId: e.target.value })
              }
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
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">Shift 1</label>
                <select
                  value={attendance.shift1}
                  onChange={(e) =>
                    setAttendance({ ...attendance, shift1: e.target.value })
                  }
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
                  onChange={(e) =>
                    setAttendance({ ...attendance, shift2: e.target.value })
                  }
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
              disabled={saving}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
            >
              {saving ? <ThreeDot color="#fff" size="medium" /> : "Save Attendance"}
            </button>
          </form>
        )}
      </div>

      {/* Attendance Table */}
      <div className="max-w-2xl mx-auto mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3 text-center">
          Attendance Records for {attendance.date}
        </h3>

        {loadingRecords ? (
          <div className="flex justify-center my-4">
            <ThreeDot color="#3196cc" size="medium" />
          </div>
        ) : (
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
                records.map((rec) => (
                  <tr key={rec.employeeId} className="border-b hover:bg-gray-50">
                    <td className="p-2">{rec.name}</td>
                    <td
                      className={`p-2 cursor-pointer ${
                        rec.shift1 === "Present" ? "bg-green-200" : "bg-red-200"
                      }`}
                      onClick={() => toggleShift(rec.employeeId, "shift1")}
                    >
                      {rec.shift1}
                    </td>
                    <td
                      className={`p-2 cursor-pointer ${
                        rec.shift2 === "Present" ? "bg-green-200" : "bg-red-200"
                      }`}
                      onClick={() => toggleShift(rec.employeeId, "shift2")}
                    >
                      {rec.shift2}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <center>
        <button
          onClick={exportPDF}
          className="m-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
        >
          Download PDF
        </button>
      </center>
    </div>
  );
}
