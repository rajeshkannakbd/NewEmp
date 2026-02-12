import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThreeDots } from "react-loader-spinner";
import { API_URL } from "../config";

export default function SalaryPage() {
  const [employees, setEmployees] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    weekStart: "",
    weekEnd: "",
  });
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [eRes, sRes] = await Promise.all([
          axios.get(`${API_URL}/employees`),
          axios.get(`${API_URL}/salary`),
        ]);
        setEmployees(eRes.data || []);
        setSalaryData(sRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!form.employeeId) return alert("Please select an employee");
    if (!form.weekStart || !form.weekEnd)
      return alert("Please select week start and end");

    setLoading(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        weekStart: new Date(form.weekStart).toISOString(),
        weekEnd: new Date(form.weekEnd).toISOString(),
      };
      console.log("Payload for salary calculation:", payload);
      const res = await axios.post(`${API_URL}/salary/calculate`, payload);
      setSalaryData((prev) => [res.data, ...prev]);
      alert("Salary calculated: " + res.data.totalSalary);
    } catch (err) {
      console.error(err);
      alert("Error calculating salary");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (salaryData.length === 0) return alert("No data");
    setPdfLoading(true);
    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Salary Report", 14, 20);

      const head = [
        [
          "Employee",
          "Week Start",
          "Week End",
          "Total Shifts",
          "Advance",
          "Net Salary",
        ],
      ];
      const body = salaryData.map((s) => [
        s.employeeId?.name || "",
        new Date(s.weekStart).toLocaleDateString(),
        new Date(s.weekEnd).toLocaleDateString(),
        s.totalShifts,
        s.totalAdvance,
        s.totalSalary,
      ]);

      autoTable(doc, { head, body, startY: 30 });

      // Add total salary at bottom
      const finalY = doc.lastAutoTable.finalY || 30;
      doc.setFontSize(14);
      doc.text(`Total of all salaries: ${totalAllSalary}`, 14, finalY + 10);

      doc.save("salary_report.pdf");
      setPdfLoading(false);
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete salary record?")) return;
    try {
      await axios.delete(`${API_URL}/salary/${id}`);
      setSalaryData((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  const totalAllSalary = salaryData.reduce(
    (sum, s) => sum + (s.totalSalary || 0),
    0
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-semibold mb-2">Calculate Weekly Salary</h2>
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={handleCalculate}
        >
          <select
            name="employeeId"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
          <label className="block text-gray-600 text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={form.weekStart}
            onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
            className="p-2 border rounded"
          />
          <label className="block text-gray-600 text-sm mb-1">End Date</label>
          <input
            type="date"
            value={form.weekEnd}
            onChange={(e) => setForm({ ...form, weekEnd: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            Calculate
          </button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Salary History</h2>
        {loading ? (
          <div className="p-4 text-center">
            <ThreeDots color="#3196cc" height={40} width={80} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="p-2 text-left">Employee</th>
                    <th className="p-2 text-left">Week Start</th>
                    <th className="p-2 text-left">Week End</th>
                    <th className="p-2 text-left">Total Shifts</th>
                    <th className="p-2 text-left">Advance</th>
                    <th className="p-2 text-left">Net Salary</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryData.map((s) => (
                    <tr key={s._id} className="border-b">
                      <td className="p-2">{s.employeeId?.name}</td>
                      <td className="p-2">
                        {new Date(s.weekStart).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {new Date(s.weekEnd).toLocaleDateString()}
                      </td>
                      <td className="p-2">{s.totalShifts}</td>
                      <td className="p-2">{s.totalAdvance}</td>
                      <td className="p-2">{s.totalSalary}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <center>
            <div className="flex-col justify-center mt-4">
              <p className="text-lg font-semibold">
                Total of all salaries:{" "}
                <span className="text-green-600">{totalAllSalary}</span>
              </p>
              <button
                onClick={exportPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {pdfLoading ? "Preparing..." : "Export PDF"}
              </button>
            </div></center>
          </>
        )}
      </div>
    </div>
  );
}
