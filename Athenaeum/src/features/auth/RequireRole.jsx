import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ROLE_HOME } from "./accounts";

/**
 * Membungkus sekelompok rute agar hanya bisa dibuka oleh role tertentu.
 * - Belum login  -> /login
 * - Salah role   -> dialihkan ke halaman utama role miliknya
 */
export default function RequireRole({ role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }
  return <Outlet />;
}
