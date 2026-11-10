// src/features/admin/staff/StaffTable.jsx
import { useMemo, useState } from "react";
import {
  formatStaffId,
  getInitials,
  getAvatarBackground,
  AVATAR_MAP,
  SHIFT_TIMES,
} from "./staffUtils";
import styles from "./StaffManagement.module.css";

export default function StaffTable({
  staffList,
  currentAdmin,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "Admin" | "Pegawai"
  const [searchTerm, setSearchTerm] = useState("");

  const totalCount = staffList.length;
  const adminCount = staffList.filter((s) => s.role === "Admin").length;
  const pegawaiCount = staffList.filter((s) => s.role === "Pegawai").length;

  // Filter & Search
  const filteredStaff = useMemo(() => {
    let list = staffList;

    // Filter berdasarkan peran
    if (activeTab === "Admin") {
      list = list.filter((s) => s.role === "Admin");
    } else if (activeTab === "Pegawai") {
      list = list.filter((s) => s.role === "Pegawai");
    }

    // Pencarian berdasarkan nama, email, atau ID
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      list = list.filter((s) => {
        const idMatch = s.id?.toLowerCase().includes(query) ||
          formatStaffId(s.id).toLowerCase().includes(query);
        const nameMatch = s.name?.toLowerCase().includes(query);
        const emailMatch = s.email?.toLowerCase().includes(query);
        return idMatch || nameMatch || emailMatch;
      });
    }

    return list;
  }, [staffList, activeTab, searchTerm]);

  const isCurrentUser = (staff) => {
    if (!currentAdmin) return false;
    return (
      staff.name === currentAdmin.name ||
      staff.email === currentAdmin.email ||
      staff.name === "Agnes Tachyon"
    );
  };

  return (
    <section className={styles.tableCard} aria-labelledby="staff-list-title">
      {/* Header Bagian */}
      <div className={styles.tableCardHeader}>
        <h2 id="staff-list-title" className={styles.sectionTitle}>
          Daftar Anggota &amp; Staf Perpustakaan
        </h2>
        <p className={styles.sectionSubtitle}>
          Tinjau penugasan jadwal, peran akun, serta status operasional staff.
        </p>
      </div>

      {/* Bar Kontrol: Filter Tabs & Pencarian */}
      <div className={styles.controlsBar}>
        <div className={styles.tabsList} role="tablist" aria-label="Filter Peran Staf">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            className={`${styles.tabBtn} ${activeTab === "all" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Semua Staff <span className={styles.tabCount}>{totalCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "Admin"}
            className={`${styles.tabBtn} ${activeTab === "Admin" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("Admin")}
          >
            Admin <span className={styles.tabCount}>{adminCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "Pegawai"}
            className={`${styles.tabBtn} ${activeTab === "Pegawai" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("Pegawai")}
          >
            Pegawai <span className={styles.tabCount}>{pegawaiCount}</span>
          </button>
        </div>

        {/* Input Pencarian */}
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari nama atau email staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Cari nama atau email staff"
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearchTerm("")}
              aria-label="Bersihkan pencarian"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Staf */}
      <div className={styles.tableResponsive}>
        <table className={styles.staffTable}>
          <thead>
            <tr>
              <th scope="col" style={{ width: "50px", textAlign: "center" }}>NO</th>
              <th scope="col" style={{ minWidth: "220px" }}>NAMA STAFF</th>
              <th scope="col" style={{ minWidth: "120px" }}>PERAN</th>
              <th scope="col" style={{ minWidth: "200px" }}>EMAIL RESMI</th>
              <th scope="col" style={{ minWidth: "160px" }}>SHIFT KERJA</th>
              <th scope="col" style={{ minWidth: "110px" }}>STATUS</th>
              <th scope="col" style={{ minWidth: "180px", textAlign: "right" }}>TINDAKAN</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  <div className={styles.emptyContainer}>
                    <p className={styles.emptyMessage}>
                      {searchTerm || activeTab !== "all"
                        ? "Tidak ada staf yang sesuai dengan filter atau pencarian saat ini."
                        : "Belum ada data staf terdaftar."}
                    </p>
                    {(searchTerm || activeTab !== "all") && (
                      <button
                        type="button"
                        className={styles.resetSearchBtn}
                        onClick={() => {
                          setSearchTerm("");
                          setActiveTab("all");
                        }}
                      >
                        Reset Filter &amp; Pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff, index) => {
                const isSelf = isCurrentUser(staff);
                const shiftTime =
                  staff.shiftTime || SHIFT_TIMES[staff.shift] || "08:00 - 13:00";
                const hasCustomAvatar = staff.avatar && AVATAR_MAP[staff.avatar];

                return (
                  <tr key={staff.id} className={styles.tableRow}>
                    {/* NO */}
                    <td className={styles.tdCenter}>{index + 1}</td>

                    {/* NAMA STAFF */}
                    <td>
                      <div className={styles.staffIdentity}>
                        {hasCustomAvatar ? (
                          <img
                            src={AVATAR_MAP[staff.avatar]}
                            alt={staff.name}
                            className={styles.staffAvatarImg}
                          />
                        ) : (
                          <div
                            className={styles.staffAvatarInitials}
                            style={{ background: getAvatarBackground(staff.name) }}
                            aria-hidden="true"
                          >
                            {getInitials(staff.name)}
                          </div>
                        )}
                        <div className={styles.staffMeta}>
                          <div className={styles.staffNameRow}>
                            <span className={styles.staffFullName}>{staff.name}</span>
                            {isSelf && (
                              <span className={styles.selfBadge}>(Anda)</span>
                            )}
                          </div>
                          <span className={styles.staffIdText}>
                            ID: {formatStaffId(staff.id)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* PERAN */}
                    <td>
                      {staff.role === "Admin" ? (
                        <span className={`${styles.rolePill} ${styles.roleAdmin}`}>
                          <span className={`${styles.statusDot} ${styles.dotCyan}`} />
                          Admin
                        </span>
                      ) : (
                        <span className={`${styles.rolePill} ${styles.rolePegawai}`}>
                          <span className={`${styles.statusDot} ${styles.dotGray}`} />
                          Pegawai
                        </span>
                      )}
                    </td>

                    {/* EMAIL RESMI */}
                    <td className={styles.emailText}>{staff.email}</td>

                    {/* SHIFT KERJA */}
                    <td>
                      <div className={styles.shiftContainer}>
                        <span className={styles.shiftName}>{staff.shift}</span>
                        <span className={styles.shiftHours}>({shiftTime})</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td>
                      {staff.status === "Aktif" ? (
                        <span className={`${styles.statusPill} ${styles.statusActive}`}>
                          <span className={`${styles.statusDot} ${styles.dotGreen}`} />
                          Aktif
                        </span>
                      ) : (
                        <span className={`${styles.statusPill} ${styles.statusInactive}`}>
                          <span className={`${styles.statusDot} ${styles.dotGray}`} />
                          Nonaktif
                        </span>
                      )}
                    </td>

                    {/* TINDAKAN */}
                    <td style={{ textAlign: "right" }}>
                      <div className={styles.actionsWrap}>
                        {/* Edit Action */}
                        <button
                          type="button"
                          className={styles.actionBtnEdit}
                          onClick={() => onEdit(staff)}
                          aria-label={`Edit staf ${staff.name}`}
                        >
                          Edit
                        </button>

                        {/* Toggle Status (Nonaktifkan / Aktifkan) */}
                        {staff.status === "Aktif" ? (
                          <button
                            type="button"
                            className={styles.actionBtnDeactivate}
                            onClick={() => onToggleStatus(staff)}
                            aria-label={`Nonaktifkan staf ${staff.name}`}
                          >
                            Nonaktifkan
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.actionBtnActivate}
                            onClick={() => onToggleStatus(staff)}
                            aria-label={`Aktifkan staf ${staff.name}`}
                          >
                            Aktifkan
                          </button>
                        )}

                        {/* Delete Action */}
                        <button
                          type="button"
                          className={styles.actionBtnDelete}
                          onClick={() => onDelete(staff)}
                          aria-label={`Hapus staf ${staff.name}`}
                          title="Hapus staf"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Informasi Sistem */}
      <div className={styles.tableFooter}>
        <p className={styles.footerRuleNote}>
          * Ketentuan sistem: Minimal satu Administrator aktif wajib dipertahankan. Akun yang sedang digunakan tidak dapat dinonaktifkan/dihapus.
        </p>
        <p className={styles.footerCountNote}>
          Menampilkan {filteredStaff.length} dari {totalCount} staf terdaftar
        </p>
      </div>
    </section>
  );
}

