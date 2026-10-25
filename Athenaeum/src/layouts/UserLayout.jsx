import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./userLayout.module.css";
import MF from "../assets/profile/MF.jpg";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/catalog", label: "Catalog" },
  { to: "/services", label: "Services & Facilities" },
];

// Ganti dengan data user dari context/auth nantinya
const USER = {
  name: "Kane Fukukitaru",
  role: "Member",
  badge: "Reader",
  avatar: MF,
};

const BookmarkIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M6 3h12v18l-6-4-6 4V3z" />
  </svg>
);

export default function UserLayout() {
  const [open, setOpen] = useState(false);
  const initials = USER.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.bar}>
          <NavLink to="/" className={styles.brand} onClick={() => setOpen(false)}>
            Athenaeum
            <br />
            Digital
          </NavLink>

          <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.right}>
            <button type="button" className={styles.iconBtn} aria-label="Bookmark">
              <BookmarkIcon />
            </button>

            <div className={styles.profile}>
              {USER.avatar ? (
                <img className={styles.avatar} src={USER.avatar} alt={USER.name} />
              ) : (
                <span className={styles.avatar}>{initials}</span>
              )}
              <div className={styles.profileText}>
                <span className={styles.profileName}>{USER.name}</span>
                <span className={styles.profileRole}>{USER.role}</span>
                <span className={styles.profileRole}>{USER.badge}</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.burger}
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}