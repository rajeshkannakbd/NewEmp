import React, { useEffect, useState } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import { API_URL } from "../config";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "",
    shiftRate: "",
    type: "Permanent",
    siteId: "",
  });
  const [editId, setEditId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load employees and sites
  const loadEmployees = async () => {
    try {
      const [empRes, siteRes] = await Promise.all([
        axios.get(`${API_URL}/employees`),
        axios.get(`${API_URL}/sites`),
      ]);
      setEmployees(empRes.data || []);
      setSites(siteRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editId) await axios.put(`${API_URL}/employees/${editId}`, form);
      else await axios.post(`${API_URL}/employees`, form);
      console.log("Submitting employee:", form);
      setForm({
        name: "",
        phone: "",
        role: "",
        shiftRate: "",
        type: "Permanent",
        siteId: "",
      });
      setEditId(null);
      await loadEmployees();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name,
      phone: emp.phone,
      role: emp.role,
      shiftRate: emp.shiftRate,
      type: emp.type || "Permanent",
      siteId: emp.siteId || "",
    });
    setEditId(emp._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete employee?")) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/employees/${id}`);
      setEmployees((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* Form */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">
          {editId ? "Edit Employee" : "Add Employee"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
            disabled={actionLoading}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full p-2 border rounded"
            required
            disabled={actionLoading}
          />
          <input
            placeholder="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full p-2 border rounded"
            disabled={actionLoading}
          />

          {/* Shift Rate and Type */}
          <div className="flex gap-2">
            <input
              placeholder="Shift Rate"
              type="number"
              value={form.shiftRate}
              onChange={(e) =>
                setForm({ ...form, shiftRate: parseFloat(e.target.value || 0) })
              }
              className="flex-1 p-2 border rounded"
              required
              disabled={actionLoading}
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="p-2 border rounded"
              disabled={actionLoading}
            >
              <option>Permanent</option>
              <option>Temporary</option>
            </select>
          </div>

          {/* Site selection */}
          <select
            value={form.siteId}
            onChange={(e) => setForm({ ...form, siteId: e.target.value })}
            className="w-full p-2 border rounded"
            disabled={actionLoading}
          >
            <option value="">Select Site</option>
            {sites.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={actionLoading}
            className={`w-full p-2 rounded text-white ${
              actionLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {actionLoading ? "Saving..." : editId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      {/* Employee List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Employees</h2>
        {initialLoading ? (
          <div className="flex justify-center p-6">
            <ThreeDots color="#3196cc" height={40} width={80} />
          </div>
        ) : (
          <div className="space-y-2">
            {employees.length === 0 ? (
              <div className="text-gray-500">No employees</div>
            ) : (
              employees.map((emp) => (
                <div
                  key={emp._id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {emp.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({emp.type})
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {emp.role} • {emp.phone}
                    </div>
                    <div className="text-sm text-gray-500">
                      Shift Rate :<span>{emp.shiftRate}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Site:{" "}
                      {emp.siteId?.name ||
                        sites.find((s) => s._id === emp.siteId)?.name ||
                        "Not assigned"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleEdit(emp)}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleDelete(emp._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
