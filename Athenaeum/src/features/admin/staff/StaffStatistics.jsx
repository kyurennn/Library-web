// src/features/admin/staff/StaffStatistics.jsx
import styles from "./StaffManagement.module.css";

export default function StaffStatistics({ staffList }) {
  const total = staffList.length;
  const adminCount = staffList.filter((s) => s.role === "Admin").length;
  const pegawaiCount = staffList.filter((s) => s.role === "Pegawai").length;
  const activeCount = staffList.filter((s) => s.status === "Aktif").length;

  return (
    <section className={styles.statsGrid} aria-label="Statistik Staf Perpustakaan">
      {/* Card 1 — Total Staff */}
      <div className={styles.statCard}>
        <div className={styles.statTop}>
          <span className={styles.statTitle}>TOTAL STAFF</span>
          <span className={`${styles.badgePill} ${styles.badgeCyan}`}>Operasional</span>
        </div>
        <div className={styles.statValueRow}>
          <span className={`${styles.statNumber} ${styles.cyan}`}>{total}</span>
          <span className={styles.statUnit}>Orang</span>
        </div>
        <div className={styles.statFooterText}>Terdaftar dalam sistem perpus</div>
      </div>

      {/* Card 2 — Administrator */}
      <div className={styles.statCard}>
        <div className={styles.statTop}>
          <span className={styles.statTitle}>ADMINISTRATOR</span>
        </div>
        <div className={styles.statValueRow}>
          <span className={`${styles.statNumber} ${styles.white}`}>{adminCount}</span>
          <span className={styles.statUnit}>Orang</span>
        </div>
        <div className={styles.statFooterText}>Pemegang hak kelola sistem</div>
      </div>

      {/* Card 3 — Pegawai Layanan */}
      <div className={styles.statCard}>
        <div className={styles.statTop}>
          <span className={styles.statTitle}>PEGAWAI LAYANAN</span>
          <span className={`${styles.badgePill} ${styles.badgeCyan}`}>Sirkulasi</span>
        </div>
        <div className={styles.statValueRow}>
          <span className={`${styles.statNumber} ${styles.cyan}`}>{pegawaiCount}</span>
          <span className={styles.statUnit}>Orang</span>
        </div>
        <div className={styles.statFooterText}>Petugas meja sirkulasi &amp; rak</div>
      </div>

      {/* Card 4 — Staff Aktif */}
      <div className={styles.statCard}>
        <div className={styles.statTop}>
          <span className={styles.statTitle}>STAFF AKTIF</span>
          <span className={`${styles.badgePill} ${styles.badgeGreen}`}>Shift Berjalan</span>
        </div>
        <div className={styles.statValueRow}>
          <span className={`${styles.statNumber} ${styles.green}`}>{activeCount}</span>
          <span className={styles.statUnit}>Orang</span>
        </div>
        <div className={styles.statFooterText}>Sedang aktif bertugas hari ini</div>
      </div>
    </section>
  );
}

