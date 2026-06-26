import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { logout, setAuthData } from "../utils/auth";

export default function ProtectedRoute({ allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        setAuthenticatedUser(response.data);
        // Sync memory state
        setAuthData(response.data.userId.toString(), response.data.role);
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium font-sans">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  if (!authenticatedUser) {
    return <Navigate to="/login" replace />;
  }

  const role = authenticatedUser.role;

  // If roles are specified and user's role is not allowed, redirect to a safe page
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/studentDashboard" replace />;
    }
  }

  return <Outlet />;
}
