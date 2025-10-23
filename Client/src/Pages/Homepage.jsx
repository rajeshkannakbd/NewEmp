import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserAlt, FaUserTie, FaUserClock, FaBuilding } from "react-icons/fa";

export default function HomePage() {
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState({ name: "", location: "" });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Load employees and sites
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, siteRes] = await Promise.all([
          axios.get("https://newemployman.onrender.com/api/employees"),
          axios.get("https://newemployman.onrender.com/api/sites"),
        ]);
        setEmployees(empRes.data);
        
        setSites(siteRes.data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const permanent = employees.filter((e) => e.type?.toLowerCase() === "permanent").length;
  const temporary = employees.filter((e) => e.type?.toLowerCase() === "temporary").length;

  // Add new site
  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newSite.name) return alert("Please enter site name");
    setAdding(true);
    try {
      const res = await axios.post("https://newemployman.onrender.com/api/sites", newSite);
      setSites([res.data, ...sites]);
      setNewSite({ name: "", location: "" });
    } catch (err) {
      console.error("Error adding site:", err.message);
    } finally {
      setAdding(false);
    }
  };

  // Delete site
  const handleDeleteSite = async (id) => {
    if (!window.confirm("Delete this site?")) return;
    try {
      await axios.delete(`https://newemployman.onrender.com/api/sites/${id}`);
      setSites(sites.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting site:", err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Dashboard Overview
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
          <FaUserAlt className="text-blue-500 text-4xl mb-2" />
          <h3 className="text-lg font-semibold">Total Employees</h3>
          <p className="text-2xl font-bold text-blue-700">{employees.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
          <FaUserTie className="text-green-500 text-4xl mb-2" />
          <h3 className="text-lg font-semibold">Permanent</h3>
          <p className="text-2xl font-bold text-green-600">{permanent}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
          <FaUserClock className="text-yellow-500 text-4xl mb-2" />
          <h3 className="text-lg font-semibold">Temporary</h3>
          <p className="text-2xl font-bold text-yellow-600">{temporary}</p>
        </div>
      </div>

      {/* Sites Management */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-center mb-4 flex items-center justify-center gap-2">
          <FaBuilding className="text-blue-600" /> Sites in Work
        </h3>

        {/* Add Site Form */}
        <form
          onSubmit={handleAddSite}
          className="flex flex-col sm:flex-row gap-2 justify-center mb-4"
        >
          <input
            type="text"
            placeholder="Site Name"
            className="border p-2 rounded-md flex-1"
            value={newSite.name}
            onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location (optional)"
            className="border p-2 rounded-md flex-1"
            value={newSite.location}
            onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
          />
          <button
            type="submit"
            disabled={adding}
            className={`px-4 py-2 rounded-md font-semibold text-white ${
              adding ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {adding ? "Adding..." : "Add Site"}
          </button>
        </form>

        {/* Sites List */}
        {sites.length === 0 ? (
          <p className="text-center text-gray-500">No sites in work</p>
        ) : (
          <ul className="divide-y">
            {sites.map((site) => (
              <li
                key={site._id}
                className="flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-semibold text-gray-800">{site.name}</p>
                  {site.location && (
                    <p className="text-sm text-gray-500">{site.location}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteSite(site._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
