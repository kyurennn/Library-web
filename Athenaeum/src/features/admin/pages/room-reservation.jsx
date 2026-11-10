// src/features/admin/pages/room-reservation.jsx
import { useMemo } from "react";
import { useFetch } from "../../../hooks/useFetch";
import { fetchJson } from "../../../api/client";
import DataState from "../../../components/DataState";
import styles from "./room-reservation.module.css";

/* ─────────────────────────────────────────
   DATA SOURCE
   Didefinisikan di sini (bukan di api/library.js) supaya halaman ini
   berdiri sendiri. Kalau nanti mau dipindah ke api/library.js, cukup
   pindahkan baris di bawah ini.
───────────────────────────────────────── */
const getRoomReservations = (signal) => fetchJson("room-reservations.json", { signal });

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const DAY_MS = 24 * 60 * 60 * 1000;
const fmtLong = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateForOffset = (offset) => fmtLong.format(new Date(Date.now() + offset * DAY_MS));

const STATUS_LABEL = {
  pending: "Menunggu",
  approved: "Disetujui",
};

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ tone, label, badge, value, unit, note }) {
  return (
    <article className={`${styles.statCard} ${styles[`tone_${tone}`]}`}>
      <div className={styles.statHead}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statBadge}>{badge}</span>
      </div>
      <p className={styles.statValue}>
        <strong>{value}</strong>
        <span>{unit}</span>
      </p>
      <p className={styles.statNote}>{note}</p>
    </article>
  );
}

/* ─────────────────────────────────────────
   PAGE (hanya untuk melihat, admin tidak mengubah status)
───────────────────────────────────────── */
export default function RoomReservation() {
  const { data, loading, error, reload } = useFetch(getRoomReservations);

  const rooms = data?.rooms ?? [];
  const timeSlots = data?.timeSlots ?? [];
  const reservations = useMemo(() => data?.reservations ?? [], [data]);

  const counts = useMemo(
    () =>
      reservations.reduce(
        (acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }),
        { pending: 0, approved: 0, rejected: 0 }
      ),
    [reservations]
  );

  // Peta "roomId|slot" -> reservasi hari ini (disetujui diprioritaskan di atas menunggu)
  const scheduleMap = useMemo(() => {
    const map = new Map();
    reservations
      .filter((r) => r.dayOffset === 0 && r.status !== "rejected")
      .forEach((r) => {
        const key = `${r.roomId}|${r.slot}`;
        const existing = map.get(key);
        if (!existing || (existing.status === "pending" && r.status === "approved")) {
          map.set(key, r);
        }
      });
    return map;
  }, [reservations]);

  const today = dateForOffset(0);

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <h1 className={styles.title}>Reservasi Ruang Perpustakaan</h1>
        <p className={styles.subtitle}>
          Kelola permohonan ruangan diskusi dan private study room · {today}
        </p>
      </header>

      {(loading || error) && (
        <DataState loading={loading} error={error} onRetry={reload} label="Memuat data reservasi..." />
      )}

      {!loading && !error && data && (
        <>
          {/* STATISTIK */}
          <section className={styles.stats} aria-label="Ringkasan reservasi">
            <StatCard
              tone="pending"
              label="Menunggu Persetujuan"
              badge="Perlu Tindakan"
              value={counts.pending}
              unit="Permintaan"
              note="Memerlukan konfirmasi ketersediaan"
            />
            <StatCard
              tone="approved"
              label="Disetujui"
              badge="Terkonfirmasi"
              value={counts.approved}
              unit="Reservasi"
              note="Jadwal aktif berjalan sesuai sesi"
            />
            <StatCard
              tone="rejected"
              label="Ditolak"
              badge="Dibatalkan"
              value={counts.rejected}
              unit="Reservasi"
              note="Bentrok jadwal atau kuota penuh"
            />
          </section>

          {/* JADWAL */}
          <section className={styles.panel} aria-labelledby="rr-schedule-title">
            <div className={styles.panelHead}>
              <h2 id="rr-schedule-title" className={styles.panelTitle}>
                Jadwal &amp; Ketersediaan Ruangan Hari Ini
              </h2>
              <p className={styles.panelSub}>
                {today} · Meeting Room (5+ orang), Private Room (1 orang)
              </p>
            </div>

            <div className={styles.board}>
              <div className={styles.boardHead}>
                <span className={styles.boardTitle}>Slot Waktu Operasional</span>
                <ul className={styles.legend}>
                  <li>
                    <span className={`${styles.dot} ${styles.dotApproved}`} /> Disetujui (Booked)
                  </li>
                  <li>
                    <span className={`${styles.dot} ${styles.dotPending}`} /> Menunggu Konfirmasi
                  </li>
                  <li>
                    <span className={`${styles.dot} ${styles.dotFree}`} /> Tersedia
                  </li>
                </ul>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col" className={styles.roomHeadCell}>
                        <span className={styles.srOnly}>Ruangan</span>
                      </th>
                      {timeSlots.map((slot) => (
                        <th key={slot} scope="col">
                          <span className={styles.slotChip}>{slot}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id}>
                        <th scope="row" className={styles.roomCell}>
                          <span className={styles.roomName}>{room.name}</span>
                          <span className={styles.roomCap}>{room.capacity}</span>
                        </th>
                        {timeSlots.map((slot) => {
                          const r = scheduleMap.get(`${room.id}|${slot}`);
                          return (
                            <td key={slot}>
                              {r ? (
                                <div className={`${styles.cell} ${styles[`cell_${r.status}`]}`}>
                                  <span className={styles.cellStatus}>
                                    <span className={styles.cellDot} />
                                    {STATUS_LABEL[r.status]}
                                  </span>
                                  <span className={styles.cellName}>{r.name}</span>
                                </div>
                              ) : (
                                <div className={`${styles.cell} ${styles.cellFree}`}>Tersedia</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}