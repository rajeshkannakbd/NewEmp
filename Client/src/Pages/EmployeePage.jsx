import React, { useState, useEffect } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", role: "", shiftRate: "" });
  const [editId, setEditId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true); // 👈 Only for first load
  const [actionLoading, setActionLoading] = useState(false); // 👈 For form buttons only

  // Load employees initially
  const loadEmployees = async () => {
    try {
      const res = await axios.get("https://newemployman.onrender.com/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error loading employees:", err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Add or Edit Employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editId) {
        await axios.put(`https://newemployman.onrender.com/api/employees/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post("https://newemployman.onrender.com/api/employees", form);
      }
      setForm({ name: "", phone: "", role: "", shiftRate: "" });
      loadEmployees(); // Refresh silently (no spinner)
    } catch (err) {
      console.error("Error saving employee:", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Edit handler
  const handleEdit = (emp) => {
    setForm({ name: emp.name, phone: emp.phone, role: emp.role, shiftRate: emp.shiftRate });
    setEditId(emp._id);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    setActionLoading(true);
    try {
      await axios.delete(`https://newemployman.onrender.com/api/employees/${id}`);
      setEmployees(employees.filter((e) => e._id !== id)); // Update locally, no spinner
    } catch (err) {
      console.error("Error deleting employee:", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Employee Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {editId ? "Edit Employee" : "Add Employee"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={actionLoading}
          />
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={actionLoading}
          />
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={actionLoading}
          />
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Shift Rate"
            value={form.shiftRate}
            onChange={(e) => setForm({ ...form, shiftRate: e.target.value })}
            disabled={actionLoading}
          />

          <button
            type="submit"
            disabled={actionLoading}
            className={`w-full py-2 rounded-md font-semibold transition-colors ${
              actionLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {actionLoading ? "Saving..." : editId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      {/* Employee List */}
      <div className="max-w-2xl mx-auto mt-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-3">Employee List</h2>

        {initialLoading ? (
          <div className="flex justify-center my-4">
            <ThreeDots color="#3196cc" height={50} width={50} />
          </div>
        ) : (
          <table className="min-w-full bg-white rounded-md shadow-md overflow-hidden">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Rate</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{emp.name}</td>
                    <td className="p-2">{emp.phone}</td>
                    <td className="p-2">{emp.role}</td>
                    <td className="p-2">{emp.shiftRate}</td>
                    <td className="p-2">
                      <button
                        disabled={actionLoading}
                        className={`m-1 py-1 px-3 rounded-md text-sm transition-colors ${
                          actionLoading
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                        onClick={() => handleEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        disabled={actionLoading}
                        className={`py-1 px-3 rounded-md text-sm transition-colors ${
                          actionLoading
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                        onClick={() => handleDelete(emp._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
