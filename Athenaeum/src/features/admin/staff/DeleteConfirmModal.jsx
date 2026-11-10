// src/features/admin/staff/DeleteConfirmModal.jsx
import { useEffect } from "react";
import { formatStaffId, getInitials, AVATAR_MAP } from "./staffUtils";
import styles from "./StaffManagement.module.css";

export default function DeleteConfirmModal({
  isOpen,
  staff,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !staff) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "460px" }}
      >
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(244, 63, 94, 0.15)",
                color: "#fb7185",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </span>
            <h2 id="delete-dialog-title" className={styles.modalTitle} style={{ color: "#fb7185" }}>
              Konfirmasi Hapus Staff
            </h2>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Tutup dialog"
          >
            &times;
          </button>
        </div>

        <div style={{ padding: "16px 0", color: "#cbd5e1", fontSize: "14px", lineHeight: 1.5 }}>
          <p style={{ margin: "0 0 14px" }}>
            Apakah Anda yakin ingin menghapus anggota staf berikut dari sistem perpustakaan?
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              background: "#080f1e",
              borderRadius: "10px",
              border: "1px solid #16223b",
            }}
          >
            {staff.avatar && AVATAR_MAP[staff.avatar] ? (
              <img
                src={AVATAR_MAP[staff.avatar]}
                alt=""
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#1e293b",
                  color: "#38bdf8",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {getInitials(staff.name)}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{staff.name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                ID: {formatStaffId(staff.id)} · {staff.role} · {staff.email}
              </div>
            </div>
          </div>

          <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
            * Perubahan hanya berlangsung di memori sesi browser dan data akan dipulihkan jika halaman dimuat ulang.
          </p>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            className={styles.deleteConfirmBtn}
            onClick={() => onConfirm(staff)}
          >
            Ya, Hapus Staff
          </button>
        </div>
      </div>
    </div>
  );
}

