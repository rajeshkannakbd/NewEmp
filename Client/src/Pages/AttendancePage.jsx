import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
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
              normalizedDate.toISOString().split("T")[0],
        );

        return {
          _id: found?._id || null,
          employeeId: emp._id,
          name: emp.name,
          shift1: found?.shift1 || "Absent",
          shift2: found?.shift2 || "Absent",
          advance: found ? (found.advance === 0 ? "" : found.advance) : "",
          siteId: found?.siteId || emp.siteId?._id || emp.siteId || "",
          overtime: found?.overtime || false, // ✅ ADD THIS
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
        overtime: rec.overtime || false,
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
      prev.map((r) => (r.employeeId === rec.employeeId ? updated : r)),
    );

    try {
      const saved = await saveAttendance(updated);
      setRecords((prev) =>
        prev.map((r) =>
          r.employeeId === rec.employeeId ? { ...updated, _id: saved._id } : r,
        ),
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
          r.employeeId === rec.employeeId ? { ...rec, _id: saved._id } : r,
        ),
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
    <div className="p-3 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* Header Card */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-lg md:text-xl font-semibold mb-3">Attendance</h2>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          {/* Date Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => changeDay(-1)}
              className="px-3 py-2 bg-gray-200 rounded-lg active:scale-95"
            >
              ←
            </button>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border rounded-lg w-full"
            />

            <button
              onClick={() => changeDay(1)}
              className="px-3 py-2 bg-gray-200 rounded-lg active:scale-95"
            >
              →
            </button>
          </div>

          <button
            onClick={exportPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Site</th>
              <th className="p-3 text-left">Shift 1</th>
              <th className="p-3 text-left">Shift 2</th>
              <th className="p-3 text-left">Advance</th>
              <th className="p-3 text-left">Overtime</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.employeeId} className="border-b">
                <td className="p-3">{rec.name}</td>

                <td className="p-3">
                  <select
                    value={rec.siteId || ""}
                    onChange={(e) =>
                      setRecords((prev) =>
                        prev.map((r) =>
                          r.employeeId === rec.employeeId
                            ? { ...r, siteId: e.target.value }
                            : r,
                        ),
                      )
                    }
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

                <td
                  className="p-3 cursor-pointer"
                  onClick={() => changeShift("shift1", rec)}
                >
                  <span
                    className={`px-3 py-1 rounded-lg ${
                      rec.shift1 === "Present" ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    {rec.shift1}
                  </span>
                </td>

                <td
                  className="p-3 cursor-pointer"
                  onClick={() => changeShift("shift2", rec)}
                >
                  <span
                    className={`px-3 py-1 rounded-lg ${
                      rec.shift2 === "Present" ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    {rec.shift2}
                  </span>
                </td>

                <td className="p-3">
                  <input
                    value={rec.advance || ""}
                    onChange={(e) =>
                      setRecords((prev) =>
                        prev.map((r) =>
                          r.employeeId === rec.employeeId
                            ? { ...r, advance: e.target.value }
                            : r,
                        ),
                      )
                    }
                    className="w-20 border p-1 rounded"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={rec.overtime || false}
                    onChange={(e) =>
                      setRecords((prev) =>
                        prev.map((r) =>
                          r.employeeId === rec.employeeId
                            ? { ...r, overtime: e.target.checked }
                            : r,
                        ),
                      )
                    }
                  />
                </td>

                <td className="p-3">
                  <button
                    onClick={() => saveRow(rec)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {records.map((rec) => (
          <div
            key={rec.employeeId}
            className="bg-white p-4 rounded-xl shadow-md space-y-3"
          >
            <div className="font-semibold text-lg">{rec.name}</div>

            <select
              value={rec.siteId || ""}
              onChange={(e) =>
                setRecords((prev) =>
                  prev.map((r) =>
                    r.employeeId === rec.employeeId
                      ? { ...r, siteId: e.target.value }
                      : r,
                  ),
                )
              }
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Select Site</option>
              {sites.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="flex justify-between gap-2">
              <button
                onClick={() => changeShift("shift1", rec)}
                className={`flex-1 py-2 rounded-lg ${
                  rec.shift1 === "Present" ? "bg-green-300" : "bg-red-300"
                }`}
              >
                Shift 1: {rec.shift1}
              </button>

              <button
                onClick={() => changeShift("shift2", rec)}
                className={`flex-1 py-2 rounded-lg ${
                  rec.shift2 === "Present" ? "bg-green-300" : "bg-red-300"
                }`}
              >
                Shift 2: {rec.shift2}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rec.overtime || false}
                onChange={(e) =>
                  setRecords((prev) =>
                    prev.map((r) =>
                      r.employeeId === rec.employeeId
                        ? { ...r, overtime: e.target.checked }
                        : r,
                    ),
                  )
                }
              />
              <span>Overtime</span>
            </div>

            <input
              placeholder="Advance"
              value={rec.advance || ""}
              onChange={(e) =>
                setRecords((prev) =>
                  prev.map((r) =>
                    r.employeeId === rec.employeeId
                      ? { ...r, advance: e.target.value }
                      : r,
                  ),
                )
              }
              className="w-full border p-2 rounded-lg"
            />

            <button
              onClick={() => saveRow(rec)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
