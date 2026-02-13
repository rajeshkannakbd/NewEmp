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

    let formattedPhone = phone.trim().replace(/\s+/g, "");

    if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.substring(1);
    }

    if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    } else if (
      !(formattedPhone.startsWith("91") && formattedPhone.length === 12)
    ) {
      alert("Invalid phone number");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        phone: formattedPhone,
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
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">

        {/* Logo Placeholder */}
        <div className="flex justify-center mb-4">
          <img
            src="/src/assets/icon.png"  // 🔥 Add your logo path here later
            alt="VM Construction Logo"
            className="h-20 w-20 object-contain"
          />
        </div>

        {/* Company Name */}
        <h1 className="text-2xl font-bold text-center text-gray-800">
          VM Constructions
        </h1>

        <p className="text-sm text-center text-gray-500 mt-1 mb-6">
          Attendance & Payroll System
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          <div className="flex items-center border rounded-xl overflow-hidden shadow-sm">
            <span className="bg-gray-100 px-4 py-3 text-gray-700 border-r font-medium">
              +91
            </span>

            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
              maxLength={10}
              className="flex-1 p-3 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          © {new Date().getFullYear()} VM Constructions
        </p>
      </div>
    </div>
  );
}
