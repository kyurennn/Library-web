import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./login.module.css";
import { useAuth } from "../AuthContext";
import { ROLES, ROLE_HOME, ROLE_LABEL } from "../accounts";

const ROLE_COPY = {
  user: {
    title: "Portal Member",
    sub: "Masuk untuk meminjam buku, memperpanjang, dan reservasi ruang.",
    userLabel: "Username Member",
    placeholder: "Nama lengkap anggota",
  },
  staff: {
    title: "Portal Staff",
    sub: "Khusus pegawai meja sirkulasi dan layanan ruangan.",
    userLabel: "Username Staff",
    placeholder: "Username staff",
  },
  admin: {
    title: "Portal Admin",
    sub: "Khusus administrator untuk mengelola seluruh sirkulasi.",
    userLabel: "Username Admin",
    placeholder: "Nama administrator",
  },
};

const STATS = [
  { value: "42.850", suffix: "+", label: "JUDUL BUKU" },
  { value: "6.480", label: "ANGGOTA AKTIF" },
  { value: "5", suffix: "Ruang", label: "KAPASITAS BACA" },
];

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z" />
    <path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const LockIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const IdIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M15 10h3M15 14h3" />
  </svg>
);
const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ROLE_ICON = { user: UserIcon, staff: LockIcon, admin: ShieldIcon };

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  // Sudah login -> langsung ke beranda role-nya
  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;

  const copy = ROLE_COPY[role];

  const handleRoleChange = (next) => {
    setRole(next);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Username dan kata sandi wajib diisi.");
      return;
    }

    const result = login(username, password, role, remember);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(ROLE_HOME[result.user.role], { replace: true });
  };

  return (
    <div className={styles.page}>
      {/* ---------- KIRI: HERO ---------- */}
      <section className={styles.hero}>
        <div className={styles.brandPill}>
          <span className={styles.brandIcon}>
            <BookIcon />
          </span>
          Athenaeum Digital
        </div>

        <h1 className={styles.heroTitle}>
          Pinjam, baca, dan
          <br />
          <span className={styles.heroAccent}>reservasi ruang</span>
          <br />
          dalam satu portal.
        </h1>
        <p className={styles.heroSub}>
          Akses koleksi pustaka ribuan judul, perpanjangan masa peminjaman mandiri, dan booking
          ruang diskusi secara real-time. Petugas masuk untuk mengelola seluruh sirkulasi.
        </p>

        <div className={styles.statRow}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statValue}>
                {s.value}
                {s.suffix && <span className={styles.statSuffix}>{s.suffix}</span>}
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- KANAN: FORM ---------- */}
      <section className={styles.formSide}>
        <div className={styles.card}>
          {role !== "user" && (
            <span className={styles.modeTag}>MODE AKSES STAFF &amp; ADMIN</span>
          )}
          <h2 className={styles.cardTitle}>{copy.title}</h2>
          <p className={styles.cardSub}>{copy.sub}</p>

          <div className={styles.roleSwitch} role="tablist" aria-label="Pilih peran">
            {ROLES.map((r) => {
              const Icon = ROLE_ICON[r];
              return (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={role === r}
                  className={`${styles.roleBtn} ${role === r ? styles.roleBtnActive : ""}`}
                  onClick={() => handleRoleChange(r)}
                >
                  <Icon />
                  {ROLE_LABEL[r]}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <div className={styles.fieldHead}>
                <label htmlFor="login-username">{copy.userLabel}</label>
              </div>
              <div className={styles.control}>
                <IdIcon />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  placeholder={copy.placeholder}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHead}>
                <label htmlFor="login-password">Kata Sandi</label>
              </div>
              <div className={styles.control}>
                <LockIcon />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  placeholder="Masukkan kata sandi"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPw((v) => !v)}
                  aria-pressed={showPw}
                >
                  {showPw ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.remember}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ingat saya
              </label>
              <button type="button" className={styles.linkBtn}>
                Lupa kata sandi?
              </button>
            </div>

            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}

            <button type="submit" className={styles.submitBtn}>
              Masuk Sekarang
              <ArrowIcon />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
