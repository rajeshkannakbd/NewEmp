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
  <div className="h-screen w-screen flex items-center justify-center bg-gray-200 overflow-hidden">
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">

      {/* Logo */}
      <div className="flex justify-center mb-5">
        <img
          src="https://res.cloudinary.com/dh9fmwhsk/image/upload/v1770973047/ChatGPT_Image_Feb_13_2026_11_17_24_AM_pjddom.png"
          alt="VM Construction Logo"
          className="h-20 w-20 object-contain"
        />
      </div>

      {/* Company Name */}
      <h1 className="text-2xl font-bold text-center text-gray-800 tracking-wide">
        VM Constructions
      </h1>

      <p className="text-sm text-center text-gray-500 mt-1 mb-6">
        Attendance & Payroll System
      </p>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">

        {/* Phone Input */}
        <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition">
          <span className="bg-gray-50 px-4 py-3 text-gray-700 border-r font-medium">
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
            className="flex-1 p-3 outline-none text-gray-700"
            required
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-2xl text-white font-semibold shadow-md transition ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 active:scale-95"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Footer */}
      <p className="text-xs text-center text-gray-400 mt-6">
        © {new Date().getFullYear()} VM Constructions
      </p>
    </div>
  </div>
);

}
