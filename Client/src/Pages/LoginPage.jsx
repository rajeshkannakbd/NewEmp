import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordVisible, setShowPasswordVisible] = useState(false);


  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    let formattedPhone = phone.trim().replace(/\s+/g, "");

    if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        phone: formattedPhone,
        password: showPassword ? password : undefined,
      });

      // 🔹 If backend says manager → show password field
      if (res.data.isManager) {
        setShowPassword(true);
        setLoading(false);
        return;
      }

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">
        <div className="flex justify-center mb-6">
          <img
            src="https://res.cloudinary.com/dh9fmwhsk/image/upload/v1770973047/ChatGPT_Image_Feb_13_2026_11_17_24_AM_pjddom.png"
            alt="VM Construction Logo"
            className="h-20 w-20 object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800">
          VM Constructions
        </h1>

        <p className="text-sm text-center text-gray-500 mt-1 mb-6">
          Attendance & Payroll System
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Phone */}
          <div className="flex items-center border rounded-2xl overflow-hidden">
            <span className="bg-gray-50 px-4 py-3 text-gray-700 border-r font-medium">
              +91
            </span>

            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              className="flex-1 p-3 outline-none"
              required
            />
          </div>

          {/* Password only if manager */}
          {/* Password only if manager */}
          {showPassword && (
            <div className="relative">
              <input
                type={showPasswordVisible ? "text" : "password"}
                placeholder="Enter Manager Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-2xl p-3 pr-12 outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setShowPasswordVisible(!showPasswordVisible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPasswordVisible ? (
                  // Eye Off
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-7-9-7a18.61 18.61 0 013.305-4.432M6.228 6.228A9.956 9.956 0 0112 5c5 0 9 7 9 7a18.603 18.603 0 01-4.293 4.93M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  // Eye
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5
               c4.477 0 8.268 2.943 9.542 7
               -1.274 4.057-5.065 7-9.542 7
               -4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-2xl text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            {loading
              ? "Please wait..."
              : showPassword
              ? "Login as Manager"
              : "Continue"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          © {new Date().getFullYear()} VM Constructions
        </p>
      </div>
    </div>
  );
}
