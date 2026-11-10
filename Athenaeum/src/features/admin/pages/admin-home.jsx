import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

// Placeholder sementara sampai dashboard admin dibuat.
export default function AdminHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px clamp(16px, 3vw, 40px)",
        background: "#0a1020",
        color: "#94a3b8",
      }}
    >
      <h1 style={{ margin: "0 0 8px", color: "#f1f5f9" }}>Halo, {user.name}</h1>
      <p style={{ margin: "0 0 24px" }}>Dashboard admin belum dibuat.</p>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          padding: "10px 18px",
          background: "transparent",
          border: "1px solid #1c2a44",
          borderRadius: 10,
          color: "#cbd5e1",
          font: "inherit",
          cursor: "pointer",
        }}
      >
        Keluar
      </button>
    </main>
  );
}
