import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThreeDots } from "react-loader-spinner";
import { API_URL } from "../config";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingRow, setSavingRow] = useState({});

  // Load employees + sites
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [empRes, siteRes] = await Promise.all([
          axios.get(`${API_URL}/employees`),
          axios.get(`${API_URL}/sites`),
        ]);
        const empData = (empRes.data || []).map((emp) => ({
          ...emp,
          defaultSite: emp.siteId || "",
        }));
        setEmployees(empData);
        setSites(siteRes.data || []);
      } catch (err) {
        console.error("Error loading:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fetch attendance
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/attendance`);
      const list = res.data || [];
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      const day = new Date(date);
      day.setHours(0, 0, 0, 0);

      const merged = employees.map((emp) => {
        const found = list.find(
          (x) =>
            x.employeeId === emp._id &&
            new Date(x.date).toISOString().split("T")[0] ===
              normalizedDate.toISOString().split("T")[0]
        );

        return {
          _id: found?._id || null,
          employeeId: emp._id,
          name: emp.name,
          shift1: found?.shift1 || "Absent",
          shift2: found?.shift2 || "Absent",
          advance: found ? (found.advance === 0 ? "" : found.advance) : "",
          siteId: found?.siteId || emp.siteId?._id || emp.siteId || "",
        };
      });

      setRecords(merged);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when employees/date change
  useEffect(() => {
    if (employees.length) fetchRecords();
  }, [date, employees]);

  // 🟢 Universal save function (upsert)
  const saveAttendance = async (rec) => {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      const payload = {
        employeeId: rec.employeeId,
        date: normalizedDate,
        siteId: rec.siteId,
        shift1: rec.shift1,
        shift2: rec.shift2,
        advance: rec.advance === "" ? 0 : parseFloat(rec.advance),
      };

      const res = await axios.post(`${API_URL}/attendance`, payload);
      return res.data;
    } catch (err) {
      console.error("Error saving:", err.response?.data || err.message);
      throw err;
    }
  };

  // Toggle shift
  const changeShift = async (shiftName, rec) => {
    if (!rec.siteId) return alert("Please select a site first");

    const newValue = rec[shiftName] === "Present" ? "Absent" : "Present";

    const updated = { ...rec, [shiftName]: newValue };

    // Update UI instantly
    setRecords((prev) =>
      prev.map((r) => (r.employeeId === rec.employeeId ? updated : r))
    );

    try {
      const saved = await saveAttendance(updated);
      setRecords((prev) =>
        prev.map((r) =>
          r.employeeId === rec.employeeId ? { ...updated, _id: saved._id } : r
        )
      );
    } catch {
      alert("Error saving shift");
    }
  };

  // Save row manually (advance/site updates)
  const saveRow = async (rec) => {
    if (!rec.siteId) return alert("Select a site first");
    setSavingRow((p) => ({ ...p, [rec.employeeId]: true }));

    try {
      const saved = await saveAttendance(rec);
      setRecords((prev) =>
        prev.map((r) =>
          r.employeeId === rec.employeeId ? { ...rec, _id: saved._id } : r
        )
      );
    } catch {
      alert("Error saving row");
    } finally {
      setSavingRow((p) => ({ ...p, [rec.employeeId]: false }));
    }
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Attendance - ${date}`, 14, 20);

    const rows = records.map((r) => [
      r.name,
      r.shift1,
      r.shift2,
      r.advance || "",
      sites.find((s) => s._id === r.siteId)?.name || "",
    ]);

    autoTable(doc, {
      head: [["Employee", "Shift 1", "Shift 2", "Advance", "Site"]],
      body: rows,
      startY: 30,
    });

    doc.save(`attendance_${date}.pdf`);
  };

  // Date navigation
  const changeDay = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <ThreeDots color="#3196cc" height={40} width={80} />
      </div>
    );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Attendance</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDay(-1)}
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              ← Prev
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              onClick={() => changeDay(1)}
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              Next →
            </button>
          </div>

          <button
            onClick={exportPDF}
            className="px-3 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-2 rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-2 text-left">Sno</th>
              <th className="p-2 text-left">Employee</th>
              <th className="p-2 text-left">Site</th>
              <th className="p-2 text-left">Shift 1</th>
              <th className="p-2 text-left">Shift 2</th>
              <th className="p-2 text-left">Advance</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, index) => (
              <tr key={rec.employeeId} className="border-b hover:bg-gray-50">
                <td className="p-2">{index}</td>
                <td className="p-2">{rec.name}</td>
                {/* Site Dropdown */}
                <td className="p-2">
                  <select
                    value={rec.siteId?._id || rec.siteId || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRecords((prev) =>
                        prev.map((r) =>
                          r.employeeId === rec.employeeId
                            ? { ...r, siteId: v }
                            : r
                        )
                      );
                    }}
                    className="border p-1 rounded"
                  >
                    <option value="">Select Site</option>
                    {sites.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* ✅ FIXED Shift 1 */}
                <td
                  className="p-2 cursor-pointer"
                  onClick={() => changeShift("shift1", rec)}
                >
                  <div
                    className={`inline-block px-3 py-1 rounded ${
                      rec.shift1 === "Present" ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    {rec.shift1}
                  </div>
                </td>

                {/* ✅ FIXED Shift 2 */}
                <td
                  className="p-2 cursor-pointer"
                  onClick={() => changeShift("shift2", rec)}
                >
                  <div
                    className={`inline-block px-3 py-1 rounded ${
                      rec.shift2 === "Present" ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    {rec.shift2}
                  </div>
                </td>

                {/* Advance */}
                <td className="p-2">
                  <input
                    placeholder="Enter amount"
                    value={rec.advance || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRecords((prev) =>
                        prev.map((r) =>
                          r.employeeId === rec.employeeId
                            ? { ...r, advance: v }
                            : r
                        )
                      );
                    }}
                    className="w-24 p-1 border rounded"
                  />
                </td>

                {/* Save Button */}
                <td className="p-2">
                  <button
                    onClick={() => saveRow(rec)}
                    disabled={savingRow[rec.employeeId]}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    {savingRow[rec.employeeId] ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
