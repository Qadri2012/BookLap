// ✅ NEW: ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Memuat...
      </div>
    );
  }

  if (!user) {
    localStorage.setItem("redirectAfterAuth", location.pathname);
    return <Navigate to="/login/user" replace />;
  }

  const allowedRoles = Array.isArray(roles)
    ? roles
    : role
    ? [role]
    : null;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}