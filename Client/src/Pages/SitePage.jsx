import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export default function SitePage() {
  const [sites, setSites] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => { load(); }, []);
  const load = async () => {
    const res = await axios.get(`${API_URL}/sites`);
    setSites(res.data || []);
  };
  const create = async () => {
    if (!name) return;
    await axios.post(`${API_URL}/sites`, { name });
    setName("");
    load();
  };
  const remove = async (id) => {
    if (!confirm("Delete site?")) return;
    await axios.delete(`${API_URL}/sites/${id}`);
    load();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-semibold mb-2">Add Site</h2>
        <div className="flex gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Site name" className="flex-1 p-2 border rounded" />
          <button onClick={create} className="px-3 bg-blue-600 text-white rounded">Add</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Sites</h2>
        {sites.map(s => (
          <div key={s._id} className="flex justify-between p-2 border rounded mb-2">
            <div>{s.name} {s.active ? <span className="text-sm text-green-600 ml-2">Active</span> : null}</div>
            <button onClick={()=>remove(s._id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
