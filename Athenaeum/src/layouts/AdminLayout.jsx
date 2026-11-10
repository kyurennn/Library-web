import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.css";
import { useAuth } from "../features/auth/AuthContext";
import defaultAvatar from "../assets/profile/AT.png";

const Icon = ({ children }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const DashboardIcon = () => (
  <Icon>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Icon>
);

const BookManagerIcon = () => (
  <Icon>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Icon>
);

const RoomIcon = () => (
  <Icon>
    <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
    <path d="M2 20h20" />
    <path d="M14 12v.01" />
  </Icon>
);

const StaffIcon = () => (
  <Icon>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

const LogoutIcon = () => (
  <Icon>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
);

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/admin", label: "Book Manager", icon: BookManagerIcon, isBookManager: true },
  { to: "/admin/reservations", label: "Reservasi Ruang", icon: RoomIcon },
  { to: "/admin/staff", label: "Staff Manajemen", icon: StaffIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isBookManagerActive =
    location.pathname === "/admin" ||
    location.pathname === "/admin/" ||
    location.pathname.startsWith("/admin/books") ||
    location.pathname.startsWith("/admin/edit-book");

  return (
    <div className={styles.shell}>
      {/* Top bar khusus mobile */}
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.burger}
          aria-label="Buka menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <span className={styles.mobileBrand}>Athenaeum Admin</span>
      </div>

      {open && <div className={styles.overlay} onClick={closeMenu} aria-hidden="true" />}

      {/* SIDEBAR ADMIN */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <img
            className={styles.avatar}
            src={user?.avatar || defaultAvatar}
            alt={user?.name || "Agnes Tachyon"}
          />
          <div className={styles.profileText}>
            <span className={styles.profileName}>{user?.name || "Agnes Tachyon"}</span>
            <span className={styles.profileRole}>Administrator</span>
          </div>
        </div>

        {/* Navigation */}
        <p className={styles.navLabel}>NAVIGASI UTAMA</p>
        <nav className={styles.nav} aria-label="Navigasi admin">
          {NAV_ITEMS.map(({ to, label, icon: NavIcon, isBookManager }) => {
            const isActive = isBookManager
              ? isBookManagerActive
              : location.pathname === to;

            return (
              <NavLink
                key={to}
                to={to}
                onClick={closeMenu}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                <NavIcon />
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.footLink} onClick={handleLogout}>
            <LogoutIcon />
            Keluar
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

