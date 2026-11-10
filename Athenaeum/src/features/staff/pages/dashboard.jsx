import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import { useAuth } from "../../auth/AuthContext";

/* ---------- DATA (ganti dengan data dari API nantinya) ---------- */
const DAY_MS = 24 * 60 * 60 * 1000;

const WEEKLY_FLOW = [
  { borrowed: 95, returned: 88 },
  { borrowed: 108, returned: 95 },
  { borrowed: 90, returned: 102 },
  { borrowed: 118, returned: 98 },
  { borrowed: 73, returned: 80 },
  { borrowed: 37, returned: 29 },
  { borrowed: 52, returned: 47 },
];

const INITIAL_PENDING = [
  { id: 1, name: "Nadia Putri", room: "Meeting Room A", dayOffset: 0, time: "10:00–12:00", people: 6 },
  { id: 2, name: "Salsabila Rahma", room: "Private Room 2", dayOffset: 0, time: "13:00–15:00", people: 1 },
  { id: 3, name: "Dimas Aditya", room: "Meeting Room A", dayOffset: 1, time: "10:00–12:00", people: 8 },
  { id: 4, name: "Intan Permata", room: "Private Room 3", dayOffset: 1, time: "15:00–17:00", people: 1 },
];

// dueOffset: selisih hari tenggat terhadap hari ini (negatif = sudah lewat)
const DUE_LOANS = [
  { id: 1, title: "Cantik Itu Luka", borrower: "Salsabila Rahma", dueOffset: -8, tone: "red" },
  { id: 2, title: "Laskar Pelangi", borrower: "Rizky Pratama", dueOffset: -6, tone: "pink" },
  { id: 3, title: "Sapiens", borrower: "Maya Anggraini", dueOffset: -3, tone: "purple" },
  { id: 4, title: "Filosofi Teras", borrower: "Intan Permata", dueOffset: -2, tone: "green" },
  { id: 5, title: "Negeri 5 Menara", borrower: "Bagas Wicaksono", dueOffset: 0, tone: "orange" },
];

const TOP_BOOKS = [
  { id: 1, title: "Atomic Habits", count: 41, tone: "gold" },
  { id: 2, title: "Pulang", count: 36, tone: "blue" },
  { id: 3, title: "Laskar Pelangi", count: 33, tone: "pink" },
  { id: 4, title: "Filosofi Teras", count: 29, tone: "green" },
  { id: 5, title: "Sapiens", count: 24, tone: "purple" },
];

const STATS = {
  activeLoans: 4912,
  overdue: 214,
  activeMembers: 6480,
};

/* ---------- HELPERS ---------- */
const addDays = (date, n) => new Date(date.getTime() + n * DAY_MS);
const nf = new Intl.NumberFormat("id-ID");

const fmtLong = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const fmtShort = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const fmtDayMonth = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" });
const fmtMonthYear = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });
const fmtWeekday = new Intl.DateTimeFormat("id-ID", { weekday: "short" });
const fmtDay = new Intl.DateTimeFormat("id-ID", { day: "numeric" });

function greetingFor(date) {
  const h = date.getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- ICONS ---------- */
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

/* ---------- BAR CHART (SVG, tanpa dependensi) ---------- */
function BarChart({ days }) {
  const W = 520;
  const H = 230;
  const L = 36;
  const R = 8;
  const T = 12;
  const B = 28;
  const MAX = 120;
  const innerW = W - L - R;
  const innerH = H - T - B;
  const slot = innerW / days.length;
  const barW = 14;
  const gap = 3;
  const y = (v) => T + innerH - (v / MAX) * innerH;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Grafik batang jumlah buku dipinjam dan dikembalikan selama 7 hari terakhir"
    >
      {[0, 30, 60, 90, 120].map((tick) => (
        <g key={tick}>
          <line x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} stroke="#1b2740" strokeWidth="1" />
          <text x={L - 8} y={y(tick) + 4} textAnchor="end" fontSize="10" fill="#64748b">
            {tick}
          </text>
        </g>
      ))}

      {days.map((d, i) => {
        const cx = L + slot * i + slot / 2;
        return (
          <g key={d.label}>
            <rect x={cx - barW - gap / 2} y={y(d.borrowed)} width={barW} height={y(0) - y(d.borrowed)} rx="2" fill="#38bdf8">
              <title>{`${d.label}: ${d.borrowed} dipinjam`}</title>
            </rect>
            <rect x={cx + gap / 2} y={y(d.returned)} width={barW} height={y(0) - y(d.returned)} rx="2" fill="#5a78b0">
              <title>{`${d.label}: ${d.returned} dikembalikan`}</title>
            </rect>
            <text x={cx} y={H - 8} textAnchor="middle" fontSize="10.5" fill="#94a3b8">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- MODAL AUDIT RESERVASI ---------- */
function ReservationDialog({ reservation, dateLabel, onClose, onDecide }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rows = [
    ["Pemohon", reservation.name],
    ["Ruangan", reservation.room],
    ["Tanggal", dateLabel],
    ["Sesi", reservation.time],
    ["Jumlah orang", `${reservation.people} orang`],
    ["Status", "Menunggu persetujuan"],
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
        <h3 id="audit-title" className={styles.modalTitle}>
          Audit Reservasi
        </h3>
        <dl className={styles.modalList}>
          {rows.map(([k, v]) => (
            <div key={k} className={styles.modalRow}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.modalActions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose} autoFocus>
            Tutup
          </button>
          <button type="button" className={styles.rejectBtn} onClick={() => onDecide(reservation, "ditolak")}>
            Tolak
          </button>
          <button type="button" className={styles.approveBtn} onClick={() => onDecide(reservation, "disetujui")}>
            Setujui
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- PAGE ---------- */
export default function StaffDashboard() {
  const { user } = useAuth();
  const [today] = useState(() => new Date());
  const [pending, setPending] = useState(INITIAL_PENDING);
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState("");

  const selected = pending.find((r) => r.id === selectedId) ?? null;

  const weeklyDays = WEEKLY_FLOW.map((d, i) => {
    const date = addDays(today, i - (WEEKLY_FLOW.length - 1));
    return { ...d, date, label: `${fmtWeekday.format(date)} ${fmtDay.format(date)}` };
  });
  const rangeStart = weeklyDays[0].date;
  const rangeEnd = weeklyDays[weeklyDays.length - 1].date;
  const maxTop = Math.max(...TOP_BOOKS.map((b) => b.count));

  const handleDecision = (reservation, decision) => {
    setPending((list) => list.filter((r) => r.id !== reservation.id));
    setSelectedId(null);
    setNotice(`Reservasi ${reservation.name} ${decision}.`);
  };

  const handleExport = () => {
    downloadCsv(`laporan-perpustakaan-${today.toISOString().slice(0, 10)}.csv`, [
      ["Laporan Ringkasan Perpustakaan", fmtLong.format(today)],
      [],
      ["Metrik", "Nilai"],
      ["Pinjaman aktif", STATS.activeLoans],
      ["Terlambat", STATS.overdue],
      ["Reservasi menunggu", pending.length],
      ["Anggota aktif", STATS.activeMembers],
      [],
      ["Tanggal", "Dipinjam", "Dikembalikan"],
      ...weeklyDays.map((d) => [fmtShort.format(d.date), d.borrowed, d.returned]),
    ]);
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>
            {greetingFor(today)}, {user.name}
          </h1>
          <p className={styles.subtitle}>Ringkasan sistem perpustakaan · {fmtLong.format(today)}</p>
        </div>
        <button type="button" className={styles.exportBtn} onClick={handleExport}>
          <DownloadIcon />
          Ekspor Laporan
        </button>
      </header>

      {/* STATS */}
      <section className={styles.statsCard} aria-label="Ringkasan statistik">
        <div className={styles.stat}>
          <span className={styles.statLabel}>PINJAMAN AKTIF</span>
          <span className={`${styles.statValue} ${styles.cyan}`}>
            {nf.format(STATS.activeLoans)} <small>Eks</small>
          </span>
          <span className={styles.statNote} data-tone="green">
            +4,2% dari minggu lalu
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>TERLAMBAT</span>
          <span className={`${styles.statValue} ${styles.red}`}>
            {nf.format(STATS.overdue)} <small>Eks</small>
          </span>
          <span className={styles.statNote} data-tone="red">
            −1,8% penanganan denda
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>RESERVASI MENUNGGU</span>
          <span className={`${styles.statValue} ${styles.cyan}`}>
            {pending.length} <small>Ruang</small>
          </span>
          <span className={styles.statNote} data-tone="amber">
            <i className={styles.dot} /> {pending.length > 0 ? "Butuh review segera" : "Semua sudah ditinjau"}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>ANGGOTA AKTIF</span>
          <span className={`${styles.statValue} ${styles.green}`}>
            {nf.format(STATS.activeMembers)} <small>Orang</small>
          </span>
          <span className={styles.statNote} data-tone="green">
            +12 anggota hari ini
          </span>
        </div>
      </section>

      {/* CHART + RESERVASI */}
      <div className={styles.row}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Peminjaman 7 Hari Terakhir</h2>
              <p className={styles.panelSub}>
                {fmtDayMonth.format(rangeStart)} – {fmtDayMonth.format(rangeEnd)} {rangeEnd.getFullYear()} ·
                Perbandingan dipinjam vs dikembalikan
              </p>
            </div>
            <ul className={styles.legend}>
              <li>
                <i style={{ background: "#38bdf8" }} /> Dipinjam
              </li>
              <li>
                <i style={{ background: "#5a78b0" }} /> Dikembalikan
              </li>
            </ul>
          </div>
          <div className={styles.chartBox}>
            <BarChart days={weeklyDays} />
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Reservasi Menunggu Review</h2>
          <p className={styles.panelSub}>Klik nama pemohon untuk membuka dialog audit detail</p>

          <p className={styles.notice} role="status" aria-live="polite">
            {notice}
          </p>

          {pending.length === 0 ? (
            <p className={styles.empty}>Tidak ada reservasi yang menunggu review.</p>
          ) : (
            <ul className={styles.list}>
              {pending.map((r) => (
                <li key={r.id}>
                  <button type="button" className={styles.resItem} onClick={() => setSelectedId(r.id)}>
                    <span className={styles.resBody}>
                      <strong>{r.name}</strong>
                      <span>
                        {r.room} · {fmtDayMonth.format(addDays(today, r.dayOffset))} · {r.time} ({r.people}{" "}
                        orang)
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

      {/* JATUH TEMPO + TERPOPULER */}
      <div className={styles.row}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Jatuh Tempo Terdekat</h2>
          <p className={styles.panelSub}>Prioritas buku yang harus segera ditindaklanjuti</p>
          <ul className={styles.list}>
            {DUE_LOANS.map((loan) => {
              const due = addDays(today, loan.dueOffset);
              const late = -loan.dueOffset;
              return (
                <li key={loan.id} className={styles.dueItem}>
                  <span className={`${styles.cover} ${styles[`tone-${loan.tone}`]}`}>{loan.title[0]}</span>
                  <span className={styles.dueBody}>
                    <strong>{loan.title}</strong>
                    <span>
                      {loan.borrower} · Tenggat {fmtShort.format(due)}
                    </span>
                  </span>
                  {late > 0 ? (
                    <span className={styles.pill} data-tone="red">
                      <i className={styles.dot} /> Terlambat {late} hari
                    </span>
                  ) : (
                    <span className={styles.pill} data-tone="amber">
                      <i className={styles.dot} /> Hari Ini
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Paling Sering Dipinjam</h2>
          <p className={styles.panelSub}>Buku terpopuler sepanjang periode {fmtMonthYear.format(today)}</p>
          <ul className={styles.list}>
            {TOP_BOOKS.map((b) => (
              <li key={b.id} className={styles.topItem}>
                <span className={`${styles.cover} ${styles[`tone-${b.tone}`]}`}>{b.title[0]}</span>
                <span className={styles.topBody}>
                  <span className={styles.topHead}>
                    <strong>{b.title}</strong>
                    <span className={styles.topCount}>{b.count}x</span>
                  </span>
                  <span className={styles.track}>
                    <span className={styles.fill} style={{ width: `${(b.count / maxTop) * 100}%` }} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {selected && (
        <ReservationDialog
          reservation={selected}
          dateLabel={fmtLong.format(addDays(today, selected.dayOffset))}
          onClose={() => setSelectedId(null)}
          onDecide={handleDecision}
        />
      )}
    </div>
  );
}
