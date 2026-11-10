// src/features/admin/staff/StaffFormModal.jsx
import { useState, useEffect } from "react";
import { isValidEmail, SHIFT_TIMES, normalizeId } from "./staffUtils";
import styles from "./StaffManagement.module.css";

export default function StaffFormModal({
  mode = "add", // "add" | "edit"
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
    const suggestedId = `STF-${String(nextNum).padStart(2, "0")}`;
    return {
      name: "",
      email: "",
      id: suggestedId,
      role: "Pegawai",
      shift: "Shift Pagi",
      status: "Aktif",
    };
  });

  const [errors, setErrors] = useState({});

  // Handle escape key
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

    // 1. Nama Lengkap
    if (!form.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Nama lengkap minimal 2 karakter.";
    }

    // 2. Email Resmi
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

    // 3. ID Staff
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

    // 4. Aturan Bisnis untuk Administrator
    if (mode === "edit" && isFinalActiveAdmin) {
      if (form.role !== "Admin") {
        newErrors.role = "Minimal satu Administrator aktif wajib dipertahankan.";
      }
      if (form.status !== "Aktif") {
        newErrors.status = "Administrator terakhir tidak dapat dinonaktifkan.";
      }
    }

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

    const payload = {
      ...(initialData || {}),
      id: formattedId,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      shift: form.shift,
      shiftTime: shiftTime,
      status: form.status,
      avatar: initialData?.avatar || null,
    };

    onSubmit(payload);
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
          {/* Baris 1: Nama Lengkap */}
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

          {/* Baris 2: Email Resmi */}
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

          {/* Baris 3: ID Staff & Peran */}
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

          {/* Baris 4: Shift Kerja & Status */}
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

          {/* Catatan jika akun khusus */}
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
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
            >
              {mode === "add" ? "Simpan Staff" : "Perbarui Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
