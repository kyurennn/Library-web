import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./StaffLayout.module.css";
import { useAuth } from "../features/auth/AuthContext";

const Icon = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
const RoomIcon = () => (
  <Icon>
    <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
    <path d="M3 21h18M14 12h.01" />
  </Icon>
);
const BookIcon = () => (
  <Icon>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6" />
  </Icon>
);
const HelpIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" />
  </Icon>
);
const SettingsIcon = () => (
  <Icon>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
);
const LogoutIcon = () => (
  <Icon>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
);

const NAV_ITEMS = [
  { to: "/staff", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/staff/reservations", label: "Reservasi Ruang", icon: RoomIcon },
  { to: "/staff/loans", label: "Pinjaman Buku", icon: BookIcon },
];

function initialsOf(name) {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
        <span className={styles.mobileBrand}>Athenaeum Staff</span>
      </div>

      {open && <div className={styles.overlay} onClick={closeMenu} aria-hidden="true" />}

      {/* SIDEBAR: sticky, tinggi 100vh, scroll sendiri bila isinya melebihi layar */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.profileCard}>
          {user.avatar ? (
            <img className={styles.avatar} src={user.avatar} alt="" />
          ) : (
            <span className={styles.avatar}>{initialsOf(user.name)}</span>
          )}
          <div className={styles.profileText}>
            <span className={styles.profileName}>{user.name}</span>
            <span className={styles.profileRole}>Staff</span>
          </div>
        </div>

        <p className={styles.navLabel}>NAVIGASI UTAMA</p>
        <nav className={styles.nav} aria-label="Navigasi staff">
          {NAV_ITEMS.map(({ to, label, icon: NavIcon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              <NavIcon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.footLink}>
            <HelpIcon />
            Pusat Bantuan
          </button>
          <button type="button" className={styles.footLink}>
            <SettingsIcon />
            Pengaturan
          </button>
          <button type="button" className={`${styles.footLink} ${styles.logout}`} onClick={handleLogout}>
            <LogoutIcon />
            Keluar
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
