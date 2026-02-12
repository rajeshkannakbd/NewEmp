import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        phone,
      });

      const { token, accessRole } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("accessRole", accessRole);

      if (accessRole === "Manager") {
        navigate("/");
      } else {
        navigate("/my-dashboard");
      }

    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
