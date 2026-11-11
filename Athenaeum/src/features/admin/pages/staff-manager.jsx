// src/features/admin/pages/staff-manager.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import { getStaff } from "../../../api/library";
import AT from "../../../assets/profile/AT.png";
import styles from "./staff-manager.module.css";

/* ─────────────────────────────────────────
   1. CONSTANTS & HELPER FUNCTIONS
───────────────────────────────────────── */
const SHIFT_TIMES = {
  "Shift Pagi": "08:00 - 13:00",
  "Shift Siang": "12:00 - 17:00",
};

function formatStaffId(id) {
  if (!id) return "";
  const clean = String(id).trim();
  return clean.startsWith("#") ? clean : `#${clean}`;
}

function normalizeId(id) {
  return String(id || "").replace(/^#/, "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

const INITIAL_COLORS = [
  "linear-gradient(135deg, #0e7490, #155e75)", // teal
  "linear-gradient(135deg, #1e40af, #1e3a8a)", // blue
  "linear-gradient(135deg, #334155, #1e293b)", // slate
  "linear-gradient(135deg, #0369a1, #075985)", // sky
  "linear-gradient(135deg, #4338ca, #3730a3)", // indigo
];

function getAvatarBackground(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return INITIAL_COLORS[Math.abs(hash) % INITIAL_COLORS.length];
}

/* ─────────────────────────────────────────
   2. SUBKOMPONEN: TOAST NOTIFICATIONS
───────────────────────────────────────── */
function Toast({ toasts, onDismiss }) {
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => onDismiss(t.id), t.duration || 4000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  if (!toasts.length) return null;

  return (
    <div className={styles.toastContainer} role="region" aria-label="Notifikasi">
      {toasts.map((toast) => {
        let typeClass = styles.toastInfo;
        if (toast.type === "success") typeClass = styles.toastSuccess;
        if (toast.type === "error") typeClass = styles.toastError;
        if (toast.type === "warning") typeClass = styles.toastWarning;

        return (
          <div key={toast.id} className={`${styles.toast} ${typeClass}`} role="alert">
            <div className={styles.toastIcon}>
              {toast.type === "success" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {toast.type === "error" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              )}
              {toast.type === "warning" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {(!toast.type || toast.type === "info") && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              )}
            </div>
            <div className={styles.toastBody}>
              {toast.title && <div className={styles.toastTitle}>{toast.title}</div>}
              <div className={styles.toastMessage}>{toast.message}</div>
            </div>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup notifikasi"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   3. SUBKOMPONEN: MODAL KONFIRMASI HAPUS
───────────────────────────────────────── */
function DeleteConfirmModal({ isOpen, staff, onClose, onConfirm }) {
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

          <div className={styles.deletePreviewBox}>
            {staff.avatar === "AT" ? (
              <img
                src={AT}
                alt=""
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: getAvatarBackground(staff.name),
                  color: "#f1f5f9",
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
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
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

/* ─────────────────────────────────────────
   4. SUBKOMPONEN: MODAL FORM (TAMBAH & EDIT)
───────────────────────────────────────── */
function StaffFormModal({
  mode = "add",
  initialData = null,
  staffList = [],
  currentAdmin = null,
  isOpen,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => {
    if (mode === "edit" && initialData) {
      return {
        name: initialData.name || "",
        email: initialData.email || "",
        id: initialData.id ? String(initialData.id).replace(/^#/, "") : "",
        role: initialData.role || "Pegawai",
        shift: initialData.shift || "Shift Pagi",
        status: initialData.status || "Aktif",
      };
    }
    const nextNum = staffList.length + 1;
    return {
      name: "",
      email: "",
      id: `STF-${String(nextNum).padStart(2, "0")}`,
      role: "Pegawai",
      shift: "Shift Pagi",
      status: "Aktif",
    };
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCurrentUser =
    initialData &&
    currentAdmin &&
    (normalizeId(initialData.id) === normalizeId(currentAdmin.id) ||
      initialData.name === currentAdmin.name ||
      initialData.email === currentAdmin.email);

  const activeAdminsCount = staffList.filter(
    (s) => s.role === "Admin" && s.status === "Aktif"
  ).length;

  const isFinalActiveAdmin =
    initialData &&
    initialData.role === "Admin" &&
    initialData.status === "Aktif" &&
    activeAdminsCount <= 1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validasi Nama
    if (!form.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Nama lengkap minimal 2 karakter.";
    }

    // Validasi Email & Duplikasi
    if (!form.email.trim()) {
      newErrors.email = "Email resmi wajib diisi.";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Format email tidak valid (contoh: nama@perpus.example).";
    } else {
      const currentIdNorm = initialData ? normalizeId(initialData.id) : null;
      const emailDup = staffList.find(
        (s) =>
          s.email.toLowerCase() === form.email.trim().toLowerCase() &&
          normalizeId(s.id) !== currentIdNorm
      );
      if (emailDup) {
        newErrors.email = "Email resmi sudah digunakan oleh staf lain.";
      }
    }

    // Validasi ID Duplikat
    if (!form.id.trim()) {
      newErrors.id = "ID Staff wajib diisi.";
    } else {
      const currentIdNorm = initialData ? normalizeId(initialData.id) : null;
      const targetIdNorm = normalizeId(form.id);
      const idDup = staffList.find(
        (s) => normalizeId(s.id) === targetIdNorm && normalizeId(s.id) !== currentIdNorm
      );
      if (idDup) {
        newErrors.id = "ID Staff sudah terdaftar dalam sistem.";
      }
    }

    // Aturan Administrator Terakhir
    if (mode === "edit" && isFinalActiveAdmin) {
      if (form.role !== "Admin") {
        newErrors.role = "Minimal satu Administrator aktif wajib dipertahankan.";
      }
      if (form.status !== "Aktif") {
        newErrors.status = "Administrator terakhir tidak dapat dinonaktifkan.";
      }
    }

    // Aturan Akun Sendiri
    if (mode === "edit" && isCurrentUser && form.status !== "Aktif") {
      newErrors.status = "Anda tidak dapat menonaktifkan akun yang sedang digunakan.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedId = form.id.trim().replace(/^#/, "");
    const shiftTime = SHIFT_TIMES[form.shift] || "08:00 - 13:00";

    onSubmit({
      ...(initialData || {}),
      id: formattedId,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      shift: form.shift,
      shiftTime: shiftTime,
      status: form.status,
      avatar: initialData?.avatar || null,
    });
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="staff-modal-title" className={styles.modalTitle}>
            {mode === "add" ? "Tambah Staff Baru" : "Edit Data Staff"}
          </h2>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Tutup form"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.modalForm}>
          {/* Nama Lengkap */}
          <div className={styles.formGroup}>
            <label htmlFor="staff-name" className={styles.formLabel}>
              Nama Lengkap <span className={styles.req}>*</span>
            </label>
            <input
              id="staff-name"
              name="name"
              type="text"
              className={`${styles.formInput} ${errors.name ? styles.inputError : ""}`}
              placeholder="Contoh: Raka Mahendra"
              value={form.name}
              onChange={handleChange}
              autoFocus
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          {/* Email Resmi */}
          <div className={styles.formGroup}>
            <label htmlFor="staff-email" className={styles.formLabel}>
              Email Resmi <span className={styles.req}>*</span>
            </label>
            <input
              id="staff-email"
              name="email"
              type="email"
              className={`${styles.formInput} ${errors.email ? styles.inputError : ""}`}
              placeholder="nama@perpus.example"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          {/* ID Staff & Peran */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="staff-id" className={styles.formLabel}>
                ID Staff <span className={styles.req}>*</span>
              </label>
              <input
                id="staff-id"
                name="id"
                type="text"
                className={`${styles.formInput} ${errors.id ? styles.inputError : ""}`}
                placeholder="ADM-01 / STF-02"
                value={form.id}
                onChange={handleChange}
              />
              {errors.id && <span className={styles.errorText}>{errors.id}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="staff-role" className={styles.formLabel}>
                Peran Akun <span className={styles.req}>*</span>
              </label>
              <select
                id="staff-role"
                name="role"
                className={`${styles.formSelect} ${errors.role ? styles.inputError : ""}`}
                value={form.role}
                onChange={handleChange}
                disabled={mode === "edit" && isFinalActiveAdmin}
              >
                <option value="Pegawai">Pegawai</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.role && <span className={styles.errorText}>{errors.role}</span>}
            </div>
          </div>

          {/* Shift Kerja & Status */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="staff-shift" className={styles.formLabel}>
                Shift Kerja <span className={styles.req}>*</span>
              </label>
              <select
                id="staff-shift"
                name="shift"
                className={styles.formSelect}
                value={form.shift}
                onChange={handleChange}
              >
                <option value="Shift Pagi">Shift Pagi (08:00–13:00)</option>
                <option value="Shift Siang">Shift Siang (12:00–17:00)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="staff-status" className={styles.formLabel}>
                Status Akun <span className={styles.req}>*</span>
              </label>
              <select
                id="staff-status"
                name="status"
                className={`${styles.formSelect} ${errors.status ? styles.inputError : ""}`}
                value={form.status}
                onChange={handleChange}
                disabled={(mode === "edit" && isFinalActiveAdmin) || (mode === "edit" && isCurrentUser)}
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              {errors.status && <span className={styles.errorText}>{errors.status}</span>}
            </div>
          </div>

          {/* Catatan akun khusus */}
          {mode === "edit" && isFinalActiveAdmin && (
            <div className={styles.formNotice}>
              * Ini adalah satu-satunya Administrator aktif. Peran dan status akun terkunci demi keamanan sistem.
            </div>
          )}
          {mode === "edit" && isCurrentUser && !isFinalActiveAdmin && (
            <div className={styles.formNotice}>
              * Ini adalah akun Anda yang sedang aktif digunakan. Status akun tidak dapat dinonaktifkan.
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Batal
            </button>
            <button type="submit" className={styles.submitBtn}>
              {mode === "add" ? "Simpan Staff" : "Perbarui Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   5. SUBKOMPONEN: KARTU STATISTIK (4 CARDS)
───────────────────────────────────────── */
function StaffStatistics({ staffList }) {
  const total = staffList.length;
  const adminCount = staffList.filter((s) => s.role === "Admin").length;
  const pegawaiCount = staffList.filter((s) => s.role === "Pegawai").length;
  const activeCount = staffList.filter((s) => s.status === "Aktif").length;

  return (
    <section className={styles.statsGrid} aria-label="Statistik Staf Perpustakaan">
      {/* Total Staff */}
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

      {/* Administrator */}
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

      {/* Pegawai Layanan */}
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

      {/* Staff Aktif */}
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

/* ─────────────────────────────────────────
   6. KOMPONEN UTAMA: StaffManager
───────────────────────────────────────── */
export default function StaffManager() {
  const { user } = useAuth();

  // Temporary frontend state
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [formModalState, setFormModalState] = useState({ isOpen: false, mode: "add", staff: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, staff: null });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", title = "") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial staff data on mount
  useEffect(() => {
    let ignore = false;
    getStaff()
      .then((data) => {
        if (!ignore) {
          setStaffList(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err?.message || "Gagal memuat data staf perpustakaan.");
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    getStaff()
      .then((data) => { setStaffList(Array.isArray(data) ? data : []); })
      .catch((err) => { setError(err?.message || "Gagal memuat data staf perpustakaan."); })
      .finally(() => { setLoading(false); });
  }, []);

  // Admin aktif yang sedang login
  const currentAdmin = user || { name: "Agnes Tachyon", role: "admin", id: "ADM-01" };

  const isSelf = (staff) => {
    return (
      staff.name === currentAdmin.name ||
      staff.email === currentAdmin.email ||
      staff.name === "Agnes Tachyon"
    );
  };

  const getActiveAdminsCount = (list = staffList) => {
    return list.filter((s) => s.role === "Admin" && s.status === "Aktif").length;
  };

  // ── FILTER & SEARCH ──
  const totalCount = staffList.length;
  const adminCount = staffList.filter((s) => s.role === "Admin").length;
  const pegawaiCount = staffList.filter((s) => s.role === "Pegawai").length;

  const filteredStaff = useMemo(() => {
    let list = staffList;
    if (activeTab === "Admin") list = list.filter((s) => s.role === "Admin");
    else if (activeTab === "Pegawai") list = list.filter((s) => s.role === "Pegawai");

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      list = list.filter((s) => {
        const idMatch = s.id?.toLowerCase().includes(query) || formatStaffId(s.id).toLowerCase().includes(query);
        const nameMatch = s.name?.toLowerCase().includes(query);
        const emailMatch = s.email?.toLowerCase().includes(query);
        return idMatch || nameMatch || emailMatch;
      });
    }
    return list;
  }, [staffList, activeTab, searchTerm]);

  // ── CRUD HANDLERS ──
  const handleOpenAdd = () => {
    setFormModalState({ isOpen: true, mode: "add", staff: null });
  };

  const handleAddSubmit = (newStaff) => {
    const idExists = staffList.some((s) => normalizeId(s.id) === normalizeId(newStaff.id));
    if (idExists) {
      addToast(`ID Staff #${newStaff.id} sudah digunakan.`, "error", "Gagal Menambahkan");
      return;
    }

    const emailExists = staffList.some((s) => s.email.toLowerCase() === newStaff.email.toLowerCase());
    if (emailExists) {
      addToast(`Email ${newStaff.email} sudah terdaftar.`, "error", "Gagal Menambahkan");
      return;
    }

    setStaffList((prev) => [newStaff, ...prev]);
    setFormModalState({ isOpen: false, mode: "add", staff: null });
    addToast(`Staf baru "${newStaff.name}" (${newStaff.role}) berhasil ditambahkan ke sistem.`, "success", "Staf Ditambahkan");
  };

  const handleOpenEdit = (staff) => {
    setFormModalState({ isOpen: true, mode: "edit", staff });
  };

  const handleEditSubmit = (updatedStaff) => {
    const originalStaff = formModalState.staff;
    const activeAdmins = getActiveAdminsCount();

    if (originalStaff && originalStaff.role === "Admin" && originalStaff.status === "Aktif" && activeAdmins <= 1) {
      if (updatedStaff.role !== "Admin") {
        addToast("Minimal satu Administrator aktif wajib dipertahankan dalam sistem.", "error", "Aturan Bisnis Dilanggar");
        return;
      }
      if (updatedStaff.status !== "Aktif") {
        addToast("Administrator aktif terakhir tidak dapat dinonaktifkan.", "error", "Aturan Bisnis Dilanggar");
        return;
      }
    }

    if (isSelf(originalStaff) && updatedStaff.status !== "Aktif") {
      addToast("Anda tidak dapat menonaktifkan akun administrator yang sedang Anda gunakan.", "error", "Akses Ditolak");
      return;
    }

    setStaffList((prev) =>
      prev.map((s) => (normalizeId(s.id) === normalizeId(originalStaff.id) ? updatedStaff : s))
    );
    setFormModalState({ isOpen: false, mode: "edit", staff: null });
    addToast(`Data staf "${updatedStaff.name}" berhasil diperbarui.`, "success", "Pembaruan Berhasil");
  };

  const handleToggleStatus = (staff) => {
    if (staff.status === "Aktif") {
      if (isSelf(staff)) {
        addToast("Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif digunakan.", "warning", "Operasi Ditolak");
        return;
      }
      if (staff.role === "Admin" && getActiveAdminsCount() <= 1) {
        addToast("Ketentuan sistem: Minimal satu Administrator aktif wajib dipertahankan.", "error", "Operasi Ditolak");
        return;
      }
      setStaffList((prev) =>
        prev.map((s) => (normalizeId(s.id) === normalizeId(staff.id) ? { ...s, status: "Nonaktif" } : s))
      );
      addToast(`Status staf "${staff.name}" diubah menjadi Nonaktif.`, "warning", "Staf Dinonaktifkan");
    } else {
      setStaffList((prev) =>
        prev.map((s) => (normalizeId(s.id) === normalizeId(staff.id) ? { ...s, status: "Aktif" } : s))
      );
      addToast(`Status staf "${staff.name}" berhasil diaktifkan kembali.`, "success", "Staf Diaktifkan");
    }
  };

  const handleOpenDelete = (staff) => {
    if (isSelf(staff)) {
      addToast("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.", "warning", "Operasi Ditolak");
      return;
    }
    if (staff.role === "Admin" && staff.status === "Aktif" && getActiveAdminsCount() <= 1) {
      addToast("Ketentuan sistem: Minimal satu Administrator aktif wajib dipertahankan.", "error", "Operasi Ditolak");
      return;
    }
    setDeleteModalState({ isOpen: true, staff });
  };

  const handleConfirmDelete = (staff) => {
    setStaffList((prev) => prev.filter((s) => normalizeId(s.id) !== normalizeId(staff.id)));
    setDeleteModalState({ isOpen: false, staff: null });
    addToast(`Staf "${staff.name}" berhasil dihapus dari sistem.`, "success", "Staf Dihapus");
  };

  const handleExportCsv = () => {
    addToast("file telah ter-download", "success");
  };

  return (
    <div className={styles.container}>
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* ── HEADER ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>
            Staff Manajemen Perpustakaan <span aria-hidden="true">👥</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Kelola hak akses akun, pembagian shift kerja, dan status aktif staf operasional.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportCsv}
            aria-label="Ekspor data staf ke CSV"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Ekspor CSV
          </button>

          <button
            type="button"
            className={styles.addBtn}
            onClick={handleOpenAdd}
            aria-label="Tambah staf baru"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Staff
          </button>
        </div>
      </header>

      {/* ── SKELETON / ERROR / CONTENT ── */}
      {loading && (
        <div className={styles.skeletonGrid} aria-busy="true" aria-label="Memuat statistik...">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.skeletonBox} style={{ height: "115px" }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className={styles.errorBox} role="alert">
          <h2 className={styles.errorTitle}>Gagal Memuat Data Staf</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button type="button" className={styles.retryBtn} onClick={handleRetry}>
            Coba Lagi
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* STATS CARDS */}
          <StaffStatistics staffList={staffList} />

          {/* TABEL STAF & KONTROL */}
          <section className={styles.tableCard} aria-labelledby="staff-list-title">
            <div className={styles.tableCardHeader}>
              <h2 id="staff-list-title" className={styles.sectionTitle}>
                Daftar Anggota &amp; Staf Perpustakaan
              </h2>
              <p className={styles.sectionSubtitle}>
                Tinjau penugasan jadwal, peran akun, serta status operasional staff.
              </p>
            </div>

            {/* Filter Tabs & Search */}
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

              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

            {/* Tabel */}
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
                      const isCurrentUserRow = isSelf(staff);
                      const shiftTime = staff.shiftTime || SHIFT_TIMES[staff.shift] || "08:00 - 13:00";
                      const hasAvatar = staff.avatar === "AT";

                      return (
                        <tr key={staff.id} className={styles.tableRow}>
                          <td className={styles.tdCenter}>{index + 1}</td>
                          <td>
                            <div className={styles.staffIdentity}>
                              {hasAvatar ? (
                                <img src={AT} alt={staff.name} className={styles.staffAvatarImg} />
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
                                  {isCurrentUserRow && <span className={styles.selfBadge}>(Anda)</span>}
                                </div>
                                <span className={styles.staffIdText}>ID: {formatStaffId(staff.id)}</span>
                              </div>
                            </div>
                          </td>
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
                          <td className={styles.emailText}>{staff.email}</td>
                          <td>
                            <div className={styles.shiftContainer}>
                              <span className={styles.shiftName}>{staff.shift}</span>
                              <span className={styles.shiftHours}>({shiftTime})</span>
                            </div>
                          </td>
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
                          <td style={{ textAlign: "right" }}>
                            <div className={styles.actionsWrap}>
                              <button
                                type="button"
                                className={styles.actionBtnEdit}
                                onClick={() => handleOpenEdit(staff)}
                                aria-label={`Edit staf ${staff.name}`}
                              >
                                Edit
                              </button>
                              {staff.status === "Aktif" ? (
                                <button
                                  type="button"
                                  className={styles.actionBtnDeactivate}
                                  onClick={() => handleToggleStatus(staff)}
                                  aria-label={`Nonaktifkan staf ${staff.name}`}
                                >
                                  Nonaktifkan
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.actionBtnActivate}
                                  onClick={() => handleToggleStatus(staff)}
                                  aria-label={`Aktifkan staf ${staff.name}`}
                                >
                                  Aktifkan
                                </button>
                              )}
                              <button
                                type="button"
                                className={styles.actionBtnDelete}
                                onClick={() => handleOpenDelete(staff)}
                                aria-label={`Hapus staf ${staff.name}`}
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

            {/* Footer Sistem */}
            <div className={styles.tableFooter}>
              <p className={styles.footerRuleNote}>
                * Ketentuan sistem: Minimal satu Administrator aktif wajib dipertahankan. Akun yang sedang digunakan tidak dapat dinonaktifkan/dihapus.
              </p>
              <p className={styles.footerCountNote}>
                Menampilkan {filteredStaff.length} dari {totalCount} staf terdaftar
              </p>
            </div>
          </section>
        </>
      )}

      {/* FORM MODAL (ADD & EDIT) */}
      <StaffFormModal
        key={formModalState.isOpen ? `${formModalState.mode}-${formModalState.staff?.id || "new"}` : "closed"}
        isOpen={formModalState.isOpen}
        mode={formModalState.mode}
        initialData={formModalState.staff}
        staffList={staffList}
        currentAdmin={currentAdmin}
        onClose={() => setFormModalState({ isOpen: false, mode: "add", staff: null })}
        onSubmit={formModalState.mode === "add" ? handleAddSubmit : handleEditSubmit}
      />

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        staff={deleteModalState.staff}
        onClose={() => setDeleteModalState({ isOpen: false, staff: null })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

