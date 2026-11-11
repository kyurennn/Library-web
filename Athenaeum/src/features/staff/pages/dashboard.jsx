import { useState } from "react";
import styles from "./dashboard.module.css";
import { useAuth } from "../../auth/AuthContext";
import { useFetch } from "../../../hooks/useFetch";
import DataState from "../../../components/DataState";
import { getStaffDashboard, getReservations, getBooks, getLoans } from "../../../api/library";
import ReservationModal from "../components/ReservationModal";
import BookThumb from "../components/BookThumb";
import { hydrateLoans, loanStatus, startOfDay } from "../loanUtils";
// Data dashboard diambil dari public/data/staff-dashboard.json lewat fetch()
const DAY_MS = 24 * 60 * 60 * 1000;

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
const fmtDayShort = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
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

/* ---------- PAGE ---------- */
function DashboardContent({ data, reservationData, books, loanData }) {
  const { stats, weeklyFlow } = data;
  const { user } = useAuth();
  const [today] = useState(() => new Date());

  // Jatuh tempo terdekat: 5 pinjaman aktif (loans.json + books.json) dengan tenggat paling dekat/terlewat
  const dueLoans = hydrateLoans(loanData.loans, books, loanData.members, startOfDay(today))
    .sort((a, b) => a.dueDate - b.dueDate)
    .slice(0, 5)
    .map((l) => ({ ...l, status: loanStatus(l, startOfDay(today), loanData.rules) }));

  // Paling sering dipinjam: hitungan dari staff-dashboard.json, detail buku dari books.json
  const topBooks = data.topBooks
    .map((t) => ({ ...t, book: books.find((b) => b.id === t.bookId) }))
    .filter((t) => t.book);
  const [items, setItems] = useState(reservationData.reservations);
  const pending = items.filter((r) => r.status === "menunggu");
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState("");

  const selected = items.find((r) => r.id === selectedId) ?? null;

  const weeklyDays = weeklyFlow.map((d, i) => {
    const date = addDays(today, i - (weeklyFlow.length - 1));
    return { ...d, date, label: `${fmtWeekday.format(date)} ${fmtDay.format(date)}` };
  });
  const rangeStart = weeklyDays[0].date;
  const rangeEnd = weeklyDays[weeklyDays.length - 1].date;
  const maxTop = Math.max(...topBooks.map((b) => b.count));

    // Reservasi lain yang sudah disetujui pada ruang, hari, dan sesi yang sama
  const clashOf = (r) =>
    items.find(
      (o) =>
        o.status === "disetujui" && o.id !== r.id && o.room === r.room && o.dayOffset === r.dayOffset && o.time === r.time
    );

  const handleDecision = (reservation, decision) => {
    if (decision === "disetujui") {
      const clash = clashOf(reservation);
      if (clash) {
        setNotice(`Tidak bisa disetujui: ${reservation.room} pada ${reservation.time} sudah dipesan ${clash.name}.`);
        return;
      }
    }
    setItems((list) => list.map((r) => (r.id === reservation.id ? { ...r, status: decision } : r)));
    setSelectedId(null);
    setNotice(`Reservasi ${reservation.name} ${decision}.`);
  };

  const handleExport = () => {
    downloadCsv(`laporan-perpustakaan-${today.toISOString().slice(0, 10)}.csv`, [
      ["Laporan Ringkasan Perpustakaan", fmtLong.format(today)],
      [],
      ["Metrik", "Nilai"],
      ["Pinjaman aktif", stats.activeLoans],
      ["Terlambat", stats.overdue],
      ["Reservasi menunggu", pending.length],
      ["Anggota aktif", stats.activeMembers],
      [],
      ["Tanggal", "Dipinjam", "Dikembalikan"],
      ...weeklyDays.map((d) => [fmtShort.format(d.date), d.borrowed, d.returned]),
    ]);
  };

  return (
    <div className={styles.page}>
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

      {/* stats */}
      <section className={styles.statsCard} aria-label="Ringkasan statistik">
        <div className={styles.stat}>
          <span className={styles.statLabel}>PINJAMAN AKTIF</span>
          <span className={`${styles.statValue} ${styles.cyan}`}>
            {nf.format(stats.activeLoans)} <small>Eks</small>
          </span>
          <span className={styles.statNote} data-tone="green">
            +4,2% dari minggu lalu
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>TERLAMBAT</span>
          <span className={`${styles.statValue} ${styles.red}`}>
            {nf.format(stats.overdue)} <small>Eks</small>
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
            {nf.format(stats.activeMembers)} <small>Orang</small>
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
            {dueLoans.length === 0 && <li className={styles.empty}>Tidak ada pinjaman aktif.</li>}
            {dueLoans.map((loan) => (
              <li key={loan.id} className={styles.dueItem}>
                <BookThumb book={loan.book} width={34} height={44} />
                <span className={styles.dueBody}>
                  <strong>{loan.book.title}</strong>
                  <span>
                    {loan.member.name} · Tenggat {fmtShort.format(loan.dueDate)}
                  </span>
                </span>
                <span
                  className={styles.pill}
                  data-tone={loan.status.kind === "terlambat" ? "red" : loan.status.kind === "dekat" ? "amber" : "green"}
                >
                  <i className={styles.dot} /> {loan.status.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Paling Sering Dipinjam</h2>
          <p className={styles.panelSub}>Buku terpopuler sepanjang periode {fmtMonthYear.format(today)}</p>
          <ul className={styles.list}>
            {topBooks.map((b) => (
              <li key={b.bookId} className={styles.topItem}>
                <BookThumb book={b.book} width={34} height={44} />
                <span className={styles.topBody}>
                  <span className={styles.topHead}>
                    <strong>{b.book.title}</strong>
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
        <ReservationModal
          reservation={{
            ...selected,
            capacity: reservationData.rooms.find((x) => x.name === selected.room)?.capacity,
            dateLabel: fmtShort.format(addDays(today, selected.dayOffset)),
            submittedLabel: `${fmtDayShort.format(addDays(today, selected.submittedOffset))} pukul ${selected.submittedTime} WIB`,
            conflict: Boolean(clashOf(selected)),
          }}
          onClose={() => setSelectedId(null)}
          onApprove={() => handleDecision(selected, "disetujui")}
          onReject={() => handleDecision(selected, "ditolak")}
        />
      )}
    </div>
  );
}

export default function StaffDashboard() {
  const dash = useFetch(getStaffDashboard);
  const resv = useFetch(getReservations);
  const books = useFetch(getBooks);
  const loans = useFetch(getLoans);
  const all = [dash, resv, books, loans];
  const loading = all.some((r) => r.loading);
  const error = all.find((r) => r.error)?.error ?? null;

  if (loading || error) {
    return (
      <DataState
        loading={loading}
        error={error}
        label="Memuat dashboard..."
        onRetry={() => all.forEach((r) => r.reload())}
      />
    );
  }

  return <DashboardContent data={dash.data} reservationData={resv.data} books={books.data} loanData={loans.data} />;
}