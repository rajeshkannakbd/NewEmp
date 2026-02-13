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

    let formattedPhone = phone.trim();

    // Remove spaces
    formattedPhone = formattedPhone.replace(/\s+/g, "");

    // If starts with +, remove it
    if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.substring(1);
    }

    // If starts with 91 and length is 12 → keep
    if (formattedPhone.startsWith("91") && formattedPhone.length === 12) {
      // already correct
    }
    // If 10 digits → add 91
    else if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    } else {
      alert("Invalid phone number");
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
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="flex items-center border rounded-lg overflow-hidden">
            {/* Country Code */}
            <span className="bg-gray-100 px-3 py-2 text-gray-700 border-r">
              +91
            </span>

            {/* Phone Input */}
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              className="flex-1 p-2 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
