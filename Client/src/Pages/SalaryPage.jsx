import React, { useState, useEffect } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SalaryPage() {
  const [employees, setEmployees] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [form, setForm] = useState({ employeeId: "", weekStart: "", weekEnd: "" });
  const [lastCalculatedId, setLastCalculatedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Load employees and all salary history on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const empRes = await axios.get("https://newemployman.onrender.com/api/employees");
        const empData = Array.isArray(empRes.data) ? empRes.data : empRes.data.employees;
        setEmployees(empData || []);

        // Fetch all salary history
        const salaryRes = await axios.get("https://newemployman.onrender.com/api/salary");
        setSalaryData(salaryRes.data);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate salary
  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!form.employeeId) return alert("Please select an employee");
    if (!form.weekStart || !form.weekEnd) return alert("Please select week start and end");

    setLoading(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        weekStart: new Date(form.weekStart),
        weekEnd: new Date(form.weekEnd),
      };
      const res = await axios.post("https://newemployman.onrender.com/api/salary/calculate", payload);
      alert(`Salary calculated: ${res.data.totalSalary}`);
      setLastCalculatedId(res.data._id);

      // Fetch updated salary history for all employees
      const updatedRes = await axios.get("https://newemployman.onrender.com/api/salary");
      setSalaryData(updatedRes.data);
    } catch (err) {
      console.error("Salary calculation error:", err.response?.data || err.message);
      alert("Error calculating salary");
    } finally {
      setLoading(false);
    }
  };

  // Delete salary record
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    setLoading(true);
    try {
      await axios.delete(`https://newemployman.onrender.com/api/salary/${id}`);
      setSalaryData(salaryData.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting salary:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export PDF
  const exportPDF = () => {
    if (salaryData.length === 0) return alert("No salary data to export");
    setPdfLoading(true);
    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Salary Report", 14, 22);

      const tableColumn = ["Employee", "Week Start", "Week End", "Total Shifts", "Total Salary"];
      const tableRows = salaryData.map((s) => [
        s.employeeId?.name,
        new Date(s.weekStart).toLocaleDateString(),
        new Date(s.weekEnd).toLocaleDateString(),
        s.totalShifts,
        s.totalSalary,
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
      });

      doc.save("Salary_Report.pdf");
      setPdfLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Salary Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Weekly Salary</h2>

        {loading ? (
          <div className="flex justify-center my-4">
            <ThreeDots color="#3196cc" height={50} width={50} />
          </div>
        ) : (
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
        )}
      </div>

      {/* Salary History Table */}
      <div className="max-w-3xl mx-auto mt-6 overflow-x-auto bg-white rounded-md shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3 text-center">Salary History (All Employees)</h3>

        {loading ? (
          <div className="flex justify-center my-4">
            <ThreeDots color="#3196cc" height={50} width={50} />
          </div>
        ) : (
          <>
            <table className="min-w-full rounded-md overflow-hidden">
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

            {/* PDF Button */}
            <div className="flex justify-center mt-4">
              {pdfLoading ? (
                <ThreeDots color="#3196cc" height={40} width={40} />
              ) : (
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                >
                  Download PDF
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
