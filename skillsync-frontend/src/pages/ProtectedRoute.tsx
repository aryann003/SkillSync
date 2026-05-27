import { Navigate, Outlet } from "react-router-dom";
import { authStore } from "../store/authStore";

export default function ProtectedRoute() {
  const isAuthenticated = authStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
