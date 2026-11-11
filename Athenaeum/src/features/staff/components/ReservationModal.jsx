import { useEffect } from "react";
import styles from "./ReservationModal.module.css";

/*
 * Popup detail reservasi (dipakai di dashboard dan halaman Reservasi Ruang).
 *
 * Props:
 *  reservation : { name, memberId, memberSince, room, capacity, people, dateLabel, time,
 *                  purpose, note, submittedLabel, totalReservations, noShow,
 *                  status ("menunggu" | "disetujui" | "ditolak"),
 *                  conflict (true/false; undefined = tidak ditampilkan) }
 *  onClose, onApprove, onReject : fungsi
 * Field yang tidak ada ditampilkan sebagai "-".
 */
const STATUS = {
  menunggu: { label: "Menunggu Review", tone: "amber" },
  disetujui: { label: "Disetujui", tone: "green" },
  ditolak: { label: "Ditolak", tone: "red" },
};

const dash = (v) => (v === undefined || v === null || v === "" ? "-" : v);

export default function ReservationModal({ reservation: r, onClose, onApprove, onReject }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const status = r.status ?? "menunggu";
  const st = STATUS[status];
  const pending = status === "menunggu";

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resv-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.head}>
          <div>
            <h3 id="resv-title" className={styles.title}>
              {r.name}
            </h3>
            <p className={styles.sub}>
              ID Anggota: {dash(r.memberId)} · Anggota sejak {dash(r.memberSince)}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Tutup" autoFocus>
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.badges}>
            <span className={styles.badge} data-tone={st.tone}>
              <i className={styles.dot} /> {st.label}
            </span>
            {pending && r.conflict === false && (
              <span className={styles.badge} data-tone="green">
                ✓ Sesi masih kosong di {r.room}
              </span>
            )}
            {pending && r.conflict === true && (
              <span className={styles.badge} data-tone="red">
                ⚠ Bentrok dengan reservasi yang sudah disetujui
              </span>
            )}
          </div>

          <h4 className={styles.section}>DETAIL PERMOHONAN RUANGAN</h4>
          <div className={styles.card}>
            <div className={styles.grid}>
              <div>
                <span className={styles.label}>RUANGAN</span>
                <strong>{dash(r.room)}</strong>
                {r.capacity && <small>Kapasitas {r.capacity}</small>}
              </div>
              <div>
                <span className={styles.label}>JUMLAH PESERTA</span>
                <strong>{dash(r.people)} orang</strong>
              </div>
              <div>
                <span className={styles.label}>TANGGAL PELAKSANAAN</span>
                <strong>{dash(r.dateLabel)}</strong>
              </div>
              <div>
                <span className={styles.label}>SESI WAKTU</span>
                <strong>{dash(r.time)} WIB</strong>
              </div>
            </div>
            <div className={styles.block}>
              <span className={styles.label}>KEPERLUAN PENGGUNAAN</span>
              <strong>{dash(r.purpose)}</strong>
            </div>
            <div className={styles.block}>
              <span className={styles.label}>CATATAN PEMOHON</span>
              <strong>{dash(r.note)}</strong>
            </div>
            <div className={styles.block}>
              <span className={styles.label}>WAKTU PENGAJUAN</span>
              <strong>{dash(r.submittedLabel)}</strong>
            </div>
          </div>

          <h4 className={styles.section}>HISTORI &amp; PROFIL PEMOHON</h4>
          <div className={styles.stats}>
            <div>
              <b>{dash(r.totalReservations)}</b>
              <span>Total Reservasi</span>
            </div>
            <div>
              <b>{dash(r.noShow)}</b>
              <span>Tidak Hadir (No-Show)</span>
            </div>
            <div>
              <b>{dash(r.memberSince)}</b>
              <span>Tahun Bergabung</span>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.ghost} onClick={onClose}>
            Tutup
          </button>
          {pending && (
            <>
              <button type="button" className={styles.reject} onClick={onReject}>
                ✕ Tolak
              </button>
              <button
                type="button"
                className={styles.approve}
                onClick={onApprove}
                disabled={r.conflict === true}
                title={r.conflict ? "Sesi ini sudah dipesan reservasi lain" : undefined}
              >
                ✓ Setujui
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
