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
    selectedDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [empRes, salRes] = await Promise.all([
          axios.get(`${API_URL}/employees`),
          axios.get(`${API_URL}/salary`),
        ]);

        setEmployees(empRes.data || []);
        setSalaryData(salRes.data || []);
      } catch (err) {
        console.error(err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ================= CALCULATE =================
  const handleCalculate = async (e) => {
    e.preventDefault();

    if (!form.employeeId)
      return alert("Please select employee");

    if (!form.selectedDate)
      return alert("Please select date");

    setLoading(true);

    try {
      const payload = {
        employeeId: form.employeeId,
        selectedDate: form.selectedDate,
      };

      const res = await axios.post(
        `${API_URL}/salary/calculate`,
        payload
      );

      const newSalary = res.data.salary;

      setSalaryData((prev) => [newSalary, ...prev]);

      alert(
        `Salary Calculated: ₹${newSalary.totalSalary}\n\nWeek: ${new Date(
          newSalary.weekStart
        ).toLocaleDateString()} - ${new Date(
          newSalary.weekEnd
        ).toLocaleDateString()}`
      );

    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || "Error calculating salary");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this salary record?")) return;

    try {
      await axios.delete(`${API_URL}/salary/${id}`);
      setSalaryData((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  // ================= TOTAL =================
  const totalAllSalary = salaryData.reduce(
    (sum, s) => sum + (Number(s.totalSalary) || 0),
    0
  );

  // ================= PDF EXPORT =================
  const exportPDF = () => {
    if (salaryData.length === 0)
      return alert("No salary data available");

    setPdfLoading(true);

    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Salary Report", 14, 20);

      const head = [[
        "Employee",
        "Week Start",
        "Week End",
        "Shifts",
        "Advance",
        "Net Salary",
      ]];

      const body = salaryData.map((s) => [
        s.employeeId?.name || "",
        new Date(s.weekStart).toLocaleDateString(),
        new Date(s.weekEnd).toLocaleDateString(),
        s.totalShifts || 0,
        s.totalAdvance || 0,
        s.totalSalary || 0,
      ]);

      autoTable(doc, { head, body, startY: 30 });

      const finalY = doc.lastAutoTable.finalY || 30;

      doc.setFontSize(14);
      doc.text(
        `Total of all salaries: ₹${totalAllSalary}`,
        14,
        finalY + 10
      );

      doc.save("salary_report.pdf");
      setPdfLoading(false);
    }, 200);
  };

  // ================= UI =================
  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Salary Management
        </h1>
        <p className="text-gray-500">
          Calculate and manage weekly employee salaries
        </p>
      </div>

      {/* CALCULATE CARD */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Calculate Weekly Salary
        </h2>

        <form
          onSubmit={handleCalculate}
          className="grid md:grid-cols-3 gap-4"
        >
          <select
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={form.employeeId}
            onChange={(e) =>
              setForm({ ...form, employeeId: e.target.value })
            }
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={form.selectedDate}
            onChange={(e) =>
              setForm({ ...form, selectedDate: e.target.value })
            }
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg p-3 transition"
          >
            Calculate
          </button>
        </form>
      </div>

      {/* HISTORY CARD */}
      <div className="bg-white p-6 rounded-2xl shadow">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Salary History
          </h2>

          <button
            onClick={exportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {pdfLoading ? "Preparing..." : "Export PDF"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-6">
            <ThreeDots color="#2563eb" height={50} width={80} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Employee</th>
                    <th className="p-3 text-left">Week Start</th>
                    <th className="p-3 text-left">Week End</th>
                    <th className="p-3 text-left">Shifts</th>
                    <th className="p-3 text-left">Advance</th>
                    <th className="p-3 text-left">Net Salary</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryData.map((s) => (
                    <tr
                      key={s._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {s.employeeId?.name}
                      </td>
                      <td className="p-3">
                        {new Date(s.weekStart).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {new Date(s.weekEnd).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {s.totalShifts}
                      </td>
                      <td className="p-3">
                        ₹{s.totalAdvance}
                      </td>
                      <td className="p-3 font-semibold text-green-600">
                        ₹{s.totalSalary}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {salaryData.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center p-6 text-gray-500"
                      >
                        No salary records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TOTAL SUMMARY */}
            <div className="mt-6 text-right">
              <p className="text-lg font-bold">
                Total of All Salaries:{" "}
                <span className="text-green-600">
                  ₹{totalAllSalary}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}