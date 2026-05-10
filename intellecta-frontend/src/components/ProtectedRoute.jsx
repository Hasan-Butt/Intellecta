import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const handleStorageChange = (e) => {
      // Listen for token or role changes from other tabs
      if (e.key === "token" || e.key === "role") {
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user's role is not allowed, redirect to a safe page
  // Assuming studentDashboard for students and dashboard for admins
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/studentDashboard" replace />;
    }
  }

  return <Outlet />;
}
