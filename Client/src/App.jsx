import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import HomePage from "./Pages/Homepage";
import EmployeePage from "./Pages/EmployeePage";
import AttendancePage from "./Pages/AttendancePage";
import SalaryPage from "./Pages/SalaryPage";
import LoginPage from "./Pages/LoginPage";
import MyDashboard from "./Pages/MyDashboard";

/* ------------------ Private Route ------------------ */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

/* ------------------ Main App Layout ------------------ */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("accessRole");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Hide header on login page
  const showHeader = token && location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      {showHeader && (
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-xl md:text-2xl font-bold text-center">
            <span className="text-3xl font-semibold">VM</span> Constructions
          </h1>

          <nav className="m-2 mt-4 flex justify-center gap-4 text-sm md:text-base">
            {role === "Manager" && (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-yellow-200"
                  }
                >
                  Home
                </NavLink>

                <NavLink
                  to="/employees"
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-yellow-200"
                  }
                >
                  Employees
                </NavLink>

                <NavLink
                  to="/attendance"
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-yellow-200"
                  }
                >
                  Attendance
                </NavLink>

                <NavLink
                  to="/salary"
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-yellow-200"
                  }
                >
                  Salary
                </NavLink>
              </>
            )}

            {role === "Worker" && (
              <NavLink
                to="/my-dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-yellow-300 font-semibold"
                    : "hover:text-yellow-200"
                }
              >
                My Dashboard
              </NavLink>
            )}

            <button
              onClick={logout}
              className="ml-4 bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </nav>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <PrivateRoute>
                <EmployeePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <AttendancePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/salary"
            element={
              <PrivateRoute>
                <SalaryPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-dashboard"
            element={
              <PrivateRoute>
                <MyDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

/* ------------------ Root Wrapper ------------------ */
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
