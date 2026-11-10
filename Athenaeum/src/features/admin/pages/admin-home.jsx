// src/features/admin/pages/admin-home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useFetch } from "../../../hooks/useFetch";
import { getAdminDashboard } from "../../../api/library";
import styles from "./admin-home.module.css";

/* ─────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────── */
const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (date, n) => new Date(date.getTime() + n * DAY_MS);
const nf = new Intl.NumberFormat("id-ID");

const fmtLong      = new Intl.DateTimeFormat("id-ID", { weekday: "long",  day: "numeric", month: "long",  year: "numeric" });
const fmtShort     = new Intl.DateTimeFormat("id-ID", {                   day: "numeric", month: "short", year: "numeric" });
const fmtDayMonth  = new Intl.DateTimeFormat("id-ID", {                   day: "numeric", month: "long" });
const fmtMonthYear = new Intl.DateTimeFormat("id-ID", {                                  month: "long",  year: "numeric" });
const fmtWeekday   = new Intl.DateTimeFormat("id-ID", { weekday: "short" });
const fmtDay       = new Intl.DateTimeFormat("id-ID", {                   day: "numeric" });

function greetingFor(date) {
  const h = date.getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}


/* ─────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────── */
const Ico = ({ children, size = 18 }) => (
  <svg
    width={size}
    height={size}
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
  <Ico>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Ico>
);

const BookIcon = () => (
  <Ico>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6" />
  </Ico>
);

const RoomIcon = () => (
  <Ico>
    <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
    <path d="M3 21h18M14 12h.01" />
  </Ico>
);

const StaffIcon = () => (
  <Ico>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </Ico>
);

const LogoutIcon = () => (
  <Ico>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Ico>
);

const ChevronIcon = () => (
  <Ico size={14}>
    <path d="m9 6 6 6-6 6" />
  </Ico>
);

const CloseIcon = () => (
  <Ico size={18}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Ico>
);

/* ─────────────────────────────────────────
   BAR CHART (pure SVG, zero deps)
───────────────────────────────────────── */
function BarChart({ days }) {
  const W = 520, H = 230, L = 36, R = 8, T = 12, B = 28, MAX = 130;
  const innerW = W - L - R;
  const innerH = H - T - B;
  const slot   = innerW / days.length;
  const barW   = 13;
  const gap    = 3;
  const y      = (v) => T + innerH - (v / MAX) * innerH;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Grafik batang jumlah buku dipinjam dan dikembalikan 7 hari terakhir"
    >
      {/* grid lines */}
      {[0, 30, 60, 90, 120].map((tick) => (
        <g key={tick}>
          <line x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} stroke="#111d33" strokeWidth="1" />
          <text x={L - 7} y={y(tick) + 4} textAnchor="end" fontSize="10" fill="#475569">
            {tick}
          </text>
        </g>
      ))}

      {/* bars */}
      {days.map((d, i) => {
        const cx = L + slot * i + slot / 2;
        return (
          <g key={d.label}>
            {/* borrowed bar */}
            <rect
              x={cx - barW - gap / 2}
              y={y(d.borrowed)}
              width={barW}
              height={y(0) - y(d.borrowed)}
              rx="2"
              fill="#38bdf8"
            >
              <title>{`${d.label}: ${d.borrowed} dipinjam`}</title>
            </rect>
            {/* returned bar */}
            <rect
              x={cx + gap / 2}
              y={y(d.returned)}
              width={barW}
              height={y(0) - y(d.returned)}
              rx="2"
              fill="#5a78b0"
            >
              <title>{`${d.label}: ${d.returned} dikembalikan`}</title>
            </rect>
            {/* x-axis label */}
            <text x={cx} y={H - 8} textAnchor="middle" fontSize="10.5" fill="#64748b">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────
   AUDIT MODAL  (view-only)
───────────────────────────────────────── */
function ReservationDialog({ reservation, dateLabel, onClose }) {
  /* Keyboard: Escape closes */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rows = [
    ["Pemohon",      reservation.name],
    ["Ruangan",      reservation.room],
    ["Tanggal",      dateLabel],
    ["Sesi",         reservation.time],
    ["Jumlah orang", `${reservation.people} orang`],
    ["Status",       "Menunggu persetujuan"],
  ];

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: tombol ✕ di kiri, judul di kanan */}
        <div className={styles.modalHeader}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Tutup dialog"
            autoFocus
          >
            <CloseIcon />
          </button>
          <h3 id="audit-title" className={styles.modalTitle}>Audit Reservasi</h3>
        </div>

        <dl className={styles.modalList}>
          {rows.map(([k, v]) => (
            <div key={k} className={styles.modalRow}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SKELETON LOADING STATE
───────────────────────────────────────── */
function DashboardSkeleton() {
  const block = (w, h) => (
    <div className={styles.skeletonBlock} style={{ width: w, height: h, flex: w === "100%" ? 1 : undefined }} />
  );

  return (
    <div className={styles.skeletonWrap} aria-busy="true" aria-label="Memuat dashboard...">
      {/* header */}
      <div className={styles.skeletonRow}>{block("260px", "36px")}</div>
      {/* stat cards */}
      <div className={styles.skeletonRow}>
        {[1, 2, 3, 4].map((n) => block("100%", "96px"))}
      </div>
      {/* two rows */}
      {[1, 2].map((r) => (
        <div key={r} className={styles.skeletonRow}>
          {block("100%", "280px")}
          {block("100%", "280px")}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   ERROR STATE
───────────────────────────────────────── */
function DashboardError({ error, onRetry }) {
  return (
    <div
      role="alert"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 40,
        color: "#94a3b8",
      }}
    >
      <p style={{ color: "#fb7185", fontWeight: 700, fontSize: 16, margin: 0 }}>
        Gagal memuat data dashboard
      </p>
      <p style={{ margin: 0, fontSize: 14 }}>{error?.message}</p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: "10px 18px",
          background: "#0284c7",
          border: "none",
          borderRadius: 10,
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Coba lagi
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD CONTENT
───────────────────────────────────────── */
function DashboardContent({ data, user }) {
  const { stats, weeklyFlow, pendingReservations, dueLoans, topBooks } = data;

  const [today]         = useState(() => new Date());
  const [selectedId, setSelectedId] = useState(null);

  const selected = pendingReservations.find((r) => r.id === selectedId) ?? null;

  /* Build weekly days with computed labels */
  const weeklyDays = weeklyFlow.map((d, i) => {
    const date = addDays(today, i - (weeklyFlow.length - 1));
    return { ...d, date, label: `${fmtWeekday.format(date)} ${fmtDay.format(date)}` };
  });

  const rangeStart = weeklyDays[0].date;
  const rangeEnd   = weeklyDays[weeklyDays.length - 1].date;
  const maxTop     = Math.max(...topBooks.map((b) => b.count));

  /* First name only for greeting */
  const firstName = user.name.split(" ")[0];

  return (
    <div className={styles.page}>
      {/* ── HEADER ── */}
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>
            {greetingFor(today)}, {firstName}
          </h1>
          <p className={styles.subtitle}>
            Ringkasan sistem perpustakaan · {fmtLong.format(today)}
          </p>
        </div>
      </header>

      {/* ── STATS CARDS ── */}
      <section className={styles.statsCard} aria-label="Ringkasan statistik perpustakaan">
        {/* Pinjaman Aktif */}
        <div className={styles.stat}>
          <span className={styles.statLabel}>PINJAMAN AKTIF</span>
          <span className={`${styles.statValue} ${styles.cyan}`}>
            {nf.format(stats.activeLoans)} <small>Eks</small>
          </span>
          <span className={styles.statNote} data-tone="green">
            +4,2% dari minggu lalu
          </span>
        </div>

        {/* Terlambat */}
        <div className={styles.stat}>
          <span className={styles.statLabel}>TERLAMBAT</span>
          <span className={`${styles.statValue} ${styles.red}`}>
            {nf.format(stats.overdue)} <small>Eks</small>
          </span>
          <span className={styles.statNote} data-tone="red">
            −1,8% penanganan denda
          </span>
        </div>

        {/* Reservasi Menunggu */}
        <div className={styles.stat}>
          <span className={styles.statLabel}>RESERVASI MENUNGGU</span>
          <span className={`${styles.statValue} ${styles.cyan}`}>
            {pendingReservations.length} <small>Ruang</small>
          </span>
          <span className={styles.statNote} data-tone="amber">
            <i className={styles.dot} />
            {pendingReservations.length > 0 ? "Butuh review segera" : "Semua sudah ditinjau"}
          </span>
        </div>

        {/* Anggota Aktif */}
        <div className={styles.stat}>
          <span className={styles.statLabel}>ANGGOTA AKTIF</span>
          <span className={`${styles.statValue} ${styles.green}`}>
            {nf.format(stats.activeMembers)} <small>Orang</small>
          </span>
          <span className={styles.statNote} data-tone="green">
            +12 anggota hari ini
          </span>
        </div>
      </section>

      {/* ── ROW 1: Chart + Reservations ── */}
      <div className={styles.row}>
        {/* Bar Chart */}
        <section className={styles.panel} aria-label="Grafik peminjaman 7 hari terakhir">
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Peminjaman 7 Hari Terakhir</h2>
              <p className={styles.panelSub}>
                {fmtDayMonth.format(rangeStart)} – {fmtDayMonth.format(rangeEnd)}{" "}
                {rangeEnd.getFullYear()} · Perbandingan dipinjam vs dikembalikan
              </p>
            </div>
            <ul className={styles.legend} role="list">
              <li>
                <i style={{ background: "#38bdf8" }} />
                Dipinjam
              </li>
              <li>
                <i style={{ background: "#5a78b0" }} />
                Dikembalikan
              </li>
            </ul>
          </div>
          <div className={styles.chartBox}>
            <BarChart days={weeklyDays} />
          </div>
        </section>

        {/* Pending Reservations */}
        <section className={styles.panel} aria-label="Reservasi menunggu review">
          <h2 className={styles.panelTitle}>Reservasi Menunggu Review</h2>
          <p className={styles.panelSub}>
            Klik nama pemohon untuk membuka dialog audit detail
          </p>

          {/* Live region removed — admin view-only, no decisions */}

          {pendingReservations.length === 0 ? (
            <p className={styles.empty}>Tidak ada reservasi yang menunggu review.</p>
          ) : (
            <ul className={styles.list}>
              {pendingReservations.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={styles.resItem}
                    onClick={() => setSelectedId(r.id)}
                    aria-label={`Buka detail reservasi ${r.name}`}
                  >
                    <span className={styles.resBody}>
                      <strong>{r.name}</strong>
                      <span>
                        {r.room} · {fmtDayMonth.format(addDays(today, r.dayOffset))} ·{" "}
                        {r.time} ({r.people} orang)
                      </span>
                    </span>
                    <ChevronIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── ROW 2: Due Loans + Top Books ── */}
      <div className={styles.row}>
        {/* Due Loans */}
        <section className={styles.panel} aria-label="Daftar buku jatuh tempo terdekat">
          <h2 className={styles.panelTitle}>Jatuh Tempo Terdekat</h2>
          <p className={styles.panelSub}>
            Prioritas buku yang harus segera ditindaklanjuti
          </p>
          <ul className={styles.list}>
            {dueLoans.map((loan) => {
              const due  = addDays(today, loan.dueOffset);
              const late = -loan.dueOffset;
              return (
                <li key={loan.id} className={styles.dueItem}>
                  <span className={`${styles.cover} ${styles[`tone-${loan.tone}`]}`} aria-hidden="true">
                    {loan.title[0]}
                  </span>
                  <span className={styles.dueBody}>
                    <strong>{loan.title}</strong>
                    <span>
                      {loan.borrower} · Tenggat {fmtShort.format(due)}
                    </span>
                  </span>
                  {late > 0 ? (
                    <span
                      className={styles.pill}
                      data-tone="red"
                      aria-label={`Terlambat ${late} hari`}
                    >
                      <i className={styles.dot} />
                      Terlambat {late} hari
                    </span>
                  ) : (
                    <span
                      className={styles.pill}
                      data-tone="amber"
                      aria-label="Jatuh tempo hari ini"
                    >
                      <i className={styles.dot} />
                      Hari Ini
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Top Books */}
        <section className={styles.panel} aria-label="Daftar buku paling sering dipinjam">
          <h2 className={styles.panelTitle}>Paling Sering Dipinjam</h2>
          <p className={styles.panelSub}>
            Buku terpopuler sepanjang periode {fmtMonthYear.format(today)}
          </p>
          <ul className={styles.list}>
            {topBooks.map((b) => (
              <li key={b.id} className={styles.topItem}>
                <span
                  className={`${styles.cover} ${styles[`tone-${b.tone}`]}`}
                  aria-hidden="true"
                >
                  {b.title[0]}
                </span>
                <span className={styles.topBody}>
                  <span className={styles.topHead}>
                    <strong>{b.title}</strong>
                    <span className={styles.topCount}>{b.count}x</span>
                  </span>
                  <span className={styles.track} role="progressbar" aria-valuenow={b.count} aria-valuemax={maxTop} aria-label={`${b.title}: ${b.count} peminjaman`}>
                    <span
                      className={styles.fill}
                      style={{ width: `${(b.count / maxTop) * 100}%` }}
                    />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── AUDIT MODAL ── */}
      {selected && (
        <ReservationDialog
          reservation={selected}
          dateLabel={fmtLong.format(addDays(today, selected.dayOffset))}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SIDEBAR NAV DATA
───────────────────────────────────────── */
const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",       Icon: DashboardIcon },
  { key: "books",      label: "Book Manager",     Icon: BookIcon      },
  { key: "reservasi",  label: "Reservasi Ruang",  Icon: RoomIcon      },
  { key: "staff",      label: "Staff Manajemen",  Icon: StaffIcon     },
];

function initialsOf(name) {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ─────────────────────────────────────────
   ROOT: AdminHome (sidebar + main)
───────────────────────────────────────── */
export default function AdminHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* Sidebar state */
  const [drawerOpen, setDrawerOpen] = useState(false);
  /* Active nav (visual only — pages not implemented yet) */
  const [activeNav, setActiveNav]   = useState("dashboard");

  /* Fetch dashboard data */
  const { data, loading, error, reload } = useFetch(getAdminDashboard);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className={styles.shell}>
      {/* ── MOBILE TOP BAR ── */}
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.burger}
          aria-label={drawerOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <span className={styles.mobileBrand}>Athenaeum Admin</span>
      </div>

      {/* ── MOBILE OVERLAY ── */}
      {drawerOpen && (
        <div
          className={styles.overlay}
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside
        className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`}
        aria-label="Navigasi admin"
      >
        {/* Profile card */}
        <div className={styles.profileCard}>
          {user.avatar ? (
            <img
              className={styles.avatar}
              src={user.avatar}
              alt=""
              width={42}
              height={42}
            />
          ) : (
            <span className={styles.avatar}>{initialsOf(user.name)}</span>
          )}
          <div className={styles.profileText}>
            <span className={styles.profileName}>{user.name}</span>
            <span className={styles.profileRole}>Administrator</span>
          </div>
        </div>

        {/* Nav links */}
        <p className={styles.navLabel} aria-hidden="true">
          NAVIGASI UTAMA
        </p>
        <nav aria-label="Menu admin">
          <ul className={styles.nav} role="list">
            {NAV_ITEMS.map(({ key, label, Icon }) => (
              <li key={key}>
                <button
                  type="button"
                  className={`${styles.navBtn} ${activeNav === key ? styles.navBtnActive : ""}`}
                  aria-current={activeNav === key ? "page" : undefined}
                  onClick={() => {
                    setActiveNav(key);
                    closeDrawer();
                  }}
                >
                  <Icon />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            <LogoutIcon />
            Keluar
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN
      ══════════════════════════════════════ */}
      <main className={styles.main} id="main-content">
        {loading && <DashboardSkeleton />}
        {!loading && error && <DashboardError error={error} onRetry={reload} />}
        {!loading && !error && data && (
          <DashboardContent data={data} user={user} />
        )}
      </main>
    </div>
  );
}
