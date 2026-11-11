import { useMemo, useState } from "react";
import styles from "./reservations.module.css";
import { useFetch } from "../../../hooks/useFetch";
import DataState from "../../../components/DataState";
import { getReservations } from "../../../api/library";
import ReservationModal from "../components/ReservationModal";

/* ---------- HELPERS ---------- */
const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);
const fmtLong = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtShort = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const fmtDayShort = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

const STATUS = {
  menunggu: { label: "Menunggu", tone: "amber" },
  disetujui: { label: "Disetujui", tone: "green" },
  ditolak: { label: "Ditolak", tone: "red" },
};
const FILTERS = [
  ["semua", "Semua Status"],
  ["menunggu", "Menunggu"],
  ["disetujui", "Disetujui"],
  ["ditolak", "Ditolak"],
];

const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Dua reservasi bentrok jika ruangan, hari, dan sesinya sama
const sameSlot = (a, b) => a.id !== b.id && a.room === b.room && a.dayOffset === b.dayOffset && a.time === b.time;

/* ---------- ISI HALAMAN ---------- */
function ReservationsContent({ data }) {
  const { rooms, timeSlots } = data;
  const [today] = useState(() => new Date());
  const [items, setItems] = useState(data.reservations);
  const [filter, setFilter] = useState("semua");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState(null); // { type: "ok" | "error", text }

  const counts = useMemo(
    () => ({
      semua: items.length,
      menunggu: items.filter((r) => r.status === "menunggu").length,
      disetujui: items.filter((r) => r.status === "disetujui").length,
      ditolak: items.filter((r) => r.status === "ditolak").length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (r) =>
        (filter === "semua" || r.status === filter) &&
        (!q || r.name.toLowerCase().includes(q) || r.room.toLowerCase().includes(q))
    );
  }, [items, filter, query]);

  const approvedConflict = (r) => items.find((o) => o.status === "disetujui" && sameSlot(o, r));

  const decide = (r, status) => {
    if (status === "disetujui") {
      const clash = approvedConflict(r);
      if (clash) {
        setNotice({
          type: "error",
          text: `Tidak bisa disetujui: ${r.room} pada ${r.time} sudah dipesan ${clash.name}.`,
        });
        return;
      }
    }
    setItems((list) => list.map((o) => (o.id === r.id ? { ...o, status } : o)));
    setSelectedId(null);
    setNotice({ type: "ok", text: `Reservasi ${r.name} ${status}.` });
  };

  const selected = items.find((r) => r.id === selectedId) ?? null;
  const modalData =
    selected && {
      ...selected,
      capacity: rooms.find((x) => x.name === selected.room)?.capacity,
      dateLabel: fmtShort.format(addDays(today, selected.dayOffset)),
      submittedLabel: `${fmtDayShort.format(addDays(today, selected.submittedOffset))} pukul ${selected.submittedTime} WIB`,
      conflict: selected.status === "menunggu" ? Boolean(approvedConflict(selected)) : undefined,
    };

  const todays = items.filter((r) => r.dayOffset === 0 && r.status !== "ditolak");
  const cellOf = (room, time) => todays.find((r) => r.room === room && r.time === time);

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Reservasi Ruang Perpustakaan</h1>
        <p className={styles.subtitle}>
          Kelola permohonan ruangan diskusi dan private study room · {fmtLong.format(today)}
        </p>
      </header>

      <p
        className={`${styles.notice} ${notice?.type === "error" ? styles.noticeError : ""}`}
        role="status"
        aria-live="polite"
        hidden={!notice}
      >
        {notice?.text}
      </p>

      {/* KARTU STATISTIK */}
      <section className={styles.stats} aria-label="Ringkasan reservasi">
        <div className={styles.statCard} data-tone="amber">
          <div className={styles.statTop}>
            <span>MENUNGGU PERSETUJUAN</span>
            <em>Perlu Tindakan</em>
          </div>
          <p className={styles.statValue}>
            {counts.menunggu} <small>Permintaan</small>
          </p>
          <p className={styles.statNote}>Memerlukan konfirmasi ketersediaan</p>
        </div>
        <div className={styles.statCard} data-tone="cyan">
          <div className={styles.statTop}>
            <span>DISETUJUI</span>
            <em>Terkonfirmasi</em>
          </div>
          <p className={styles.statValue}>
            {counts.disetujui} <small>Reservasi</small>
          </p>
          <p className={styles.statNote}>Jadwal aktif berjalan sesuai sesi</p>
        </div>
        <div className={styles.statCard} data-tone="red">
          <div className={styles.statTop}>
            <span>DITOLAK</span>
            <em>Dibatalkan</em>
          </div>
          <p className={styles.statValue}>
            {counts.ditolak} <small>Reservasi</small>
          </p>
          <p className={styles.statNote}>Bentrok jadwal atau kuota penuh</p>
        </div>
      </section>

      {/* JADWAL HARI INI */}
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Jadwal &amp; Ketersediaan Ruangan Hari Ini</h2>
        <p className={styles.panelSub}>
          {fmtLong.format(today)} · Meeting Room (5+ orang), Private Room (1 orang)
        </p>

        <div className={styles.schedule}>
          <div className={styles.scheduleHead}>
            <strong>Slot Waktu Operasional</strong>
            <ul className={styles.legend}>
              <li data-tone="cyan">Disetujui (Booked)</li>
              <li data-tone="amber">Menunggu Konfirmasi</li>
              <li data-tone="free">Tersedia</li>
            </ul>
          </div>

          <div className={styles.gridScroll}>
            <div
              className={styles.grid}
              style={{ gridTemplateColumns: `150px repeat(${timeSlots.length}, minmax(120px, 1fr))` }}
            >
              <div />
              {timeSlots.map((t) => (
                <div key={t} className={styles.slotHead}>
                  {t}
                </div>
              ))}

              {rooms.map((room) => (
                <div key={room.name} className={styles.roomRow}>
                  <div className={styles.roomName}>
                    <strong>{room.name}</strong>
                    <span>Kapasitas {room.capacity}</span>
                  </div>
                  {timeSlots.map((t) => {
                    const r = cellOf(room.name, t);
                    if (!r) {
                      return (
                        <div key={t} className={`${styles.cell} ${styles.cellFree}`}>
                          Tersedia
                        </div>
                      );
                    }
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.cell} ${styles.cellBooked}`}
                        data-tone={r.status === "disetujui" ? "cyan" : "amber"}
                        onClick={() => setSelectedId(r.id)}
                      >
                        <strong>
                          • {r.status === "disetujui" ? "Disetujui" : "Menunggu"}
                        </strong>
                        <span>{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TABEL PERMOHONAN */}
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Daftar Permohonan Reservasi Ruang</h2>
        <p className={styles.panelSub}>Tinjau, setujui, atau tolak permohonan dari anggota perpustakaan</p>

        <div className={styles.toolbar}>
          <div className={styles.chips} role="tablist" aria-label="Filter status">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className={`${styles.chip} ${filter === key ? styles.chipActive : ""}`}
                onClick={() => setFilter(key)}
              >
                {label} <span>{counts[key]}</span>
              </button>
            ))}
          </div>
          <input
            type="search"
            className={styles.search}
            placeholder="Cari pemesan atau ruang..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari pemesan atau ruang"
          />
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NO</th>
                <th>PEMESAN</th>
                <th>RUANG</th>
                <th>TANGGAL</th>
                <th>SESI WAKTU</th>
                <th>PESERTA</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    Tidak ada reservasi yang cocok dengan filter.
                  </td>
                </tr>
              )}
              {visible.map((r, i) => (
                <tr
                  key={r.id}
                  className={styles.row}
                  tabIndex={0}
                  onClick={() => setSelectedId(r.id)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedId(r.id)}
                >
                  <td>{i + 1}</td>
                  <td>
                    <div className={styles.person}>
                      <span className={styles.avatar}>{initials(r.name)}</span>
                      <strong>{r.name}</strong>
                    </div>
                  </td>
                  <td>{r.room}</td>
                  <td>{fmtShort.format(addDays(today, r.dayOffset))}</td>
                  <td>{r.time}</td>
                  <td>{r.people} orang</td>
                  <td>
                    <span className={styles.pill} data-tone={STATUS[r.status].tone}>
                      <i /> {STATUS[r.status].label}
                    </span>
                  </td>
                  <td>
                    {r.status === "menunggu" ? (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.approve}
                          onClick={(e) => {
                            e.stopPropagation();
                            decide(r, "disetujui");
                          }}
                        >
                          ✓ Setujui
                        </button>
                        <button
                          type="button"
                          className={styles.reject}
                          onClick={(e) => {
                            e.stopPropagation();
                            decide(r, "ditolak");
                          }}
                        >
                          ✕ Tolak
                        </button>
                      </div>
                    ) : (
                      <span className={styles.done}>Selesai diproses</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.tableFoot}>
            Menampilkan <b>{visible.length}</b> dari <b>{items.length}</b> reservasi terdata.
          </p>
        </div>
      </section>

      {modalData && (
        <ReservationModal
          reservation={modalData}
          onClose={() => setSelectedId(null)}
          onApprove={() => decide(selected, "disetujui")}
          onReject={() => decide(selected, "ditolak")}
        />
      )}
    </div>
  );
}

/* ---------- PAGE: ambil data lewat fetch() dari public/data/reservations.json ---------- */
export default function Reservations() {
  const { data, loading, error, reload } = useFetch(getReservations);

  if (loading || error) {
    return <DataState loading={loading} error={error} onRetry={reload} label="Memuat reservasi..." />;
  }
  return <ReservationsContent data={data} />;
}
