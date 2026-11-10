// src/features/admin/staff/StaffManagement.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import { getStaff } from "../../../api/library";
import { normalizeId } from "./staffUtils";
import StaffStatistics from "./StaffStatistics";
import StaffTable from "./StaffTable";
import StaffFormModal from "./StaffFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Toast from "./Toast";
import styles from "./StaffManagement.module.css";

export default function StaffManagement() {
  const { user } = useAuth();

  // Temporary frontend state (strictly in-memory, no localStorage/sessionStorage)
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [formModalState, setFormModalState] = useState({
    isOpen: false,
    mode: "add", // "add" | "edit"
    staff: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    staff: null,
  });

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
    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    getStaff()
      .then((data) => {
        setStaffList(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err?.message || "Gagal memuat data staf perpustakaan.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Current admin identification
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

  // ── CRUD: CREATE (Add Staff) ──
  const handleOpenAdd = () => {
    setFormModalState({
      isOpen: true,
      mode: "add",
      staff: null,
    });
  };

  const handleAddSubmit = (newStaff) => {
    // Validasi duplikat
    const idExists = staffList.some(
      (s) => normalizeId(s.id) === normalizeId(newStaff.id)
    );
    if (idExists) {
      addToast(`ID Staff #${newStaff.id} sudah digunakan.`, "error", "Gagal Menambahkan");
      return;
    }

    const emailExists = staffList.some(
      (s) => s.email.toLowerCase() === newStaff.email.toLowerCase()
    );
    if (emailExists) {
      addToast(`Email ${newStaff.email} sudah terdaftar.`, "error", "Gagal Menambahkan");
      return;
    }

    setStaffList((prev) => [newStaff, ...prev]);
    setFormModalState({ isOpen: false, mode: "add", staff: null });
    addToast(
      `Staf baru "${newStaff.name}" (${newStaff.role}) berhasil ditambahkan ke sistem.`,
      "success",
      "Staf Ditambahkan"
    );
  };

  // ── CRUD: UPDATE (Edit Staff) ──
  const handleOpenEdit = (staff) => {
    setFormModalState({
      isOpen: true,
      mode: "edit",
      staff,
    });
  };

  const handleEditSubmit = (updatedStaff) => {
    const originalStaff = formModalState.staff;
    const activeAdmins = getActiveAdminsCount();

    // Aturan bisnis: Administrator terakhir
    const wasActiveAdmin =
      originalStaff &&
      originalStaff.role === "Admin" &&
      originalStaff.status === "Aktif";

    if (wasActiveAdmin && activeAdmins <= 1) {
      if (updatedStaff.role !== "Admin") {
        addToast(
          "Minimal satu Administrator aktif wajib dipertahankan dalam sistem.",
          "error",
          "Aturan Bisnis Dilanggar"
        );
        return;
      }
      if (updatedStaff.status !== "Aktif") {
        addToast(
          "Administrator aktif terakhir tidak dapat dinonaktifkan.",
          "error",
          "Aturan Bisnis Dilanggar"
        );
        return;
      }
    }

    // Aturan bisnis: Akun sendiri
    if (isSelf(originalStaff) && updatedStaff.status !== "Aktif") {
      addToast(
        "Anda tidak dapat menonaktifkan akun administrator yang sedang Anda gunakan.",
        "error",
        "Akses Ditolak"
      );
      return;
    }

    setStaffList((prev) =>
      prev.map((s) => (normalizeId(s.id) === normalizeId(originalStaff.id) ? updatedStaff : s))
    );
    setFormModalState({ isOpen: false, mode: "edit", staff: null });
    addToast(
      `Data staf "${updatedStaff.name}" berhasil diperbarui.`,
      "success",
      "Pembaruan Berhasil"
    );
  };

  // ── TOGGLE STATUS: AKTIFKAN / NONAKTIFKAN ──
  const handleToggleStatus = (staff) => {
    if (staff.status === "Aktif") {
      // Validasi penonaktifan
      if (isSelf(staff)) {
        addToast(
          "Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif digunakan.",
          "warning",
          "Operasi Ditolak"
        );
        return;
      }

      if (staff.role === "Admin" && getActiveAdminsCount() <= 1) {
        addToast(
          "Ketentuan sistem: Minimal satu Administrator aktif wajib dipertahankan.",
          "error",
          "Operasi Ditolak"
        );
        return;
      }

      // Nonaktifkan
      setStaffList((prev) =>
        prev.map((s) =>
          normalizeId(s.id) === normalizeId(staff.id) ? { ...s, status: "Nonaktif" } : s
        )
      );
      addToast(`Status staf "${staff.name}" diubah menjadi Nonaktif.`, "warning", "Staf Dinonaktifkan");
    } else {
      // Aktifkan
      setStaffList((prev) =>
        prev.map((s) =>
          normalizeId(s.id) === normalizeId(staff.id) ? { ...s, status: "Aktif" } : s
        )
      );
      addToast(`Status staf "${staff.name}" berhasil diaktifkan kembali.`, "success", "Staf Diaktifkan");
    }
  };

  // ── CRUD: DELETE ──
  const handleOpenDelete = (staff) => {
    if (isSelf(staff)) {
      addToast(
        "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.",
        "warning",
        "Operasi Ditolak"
      );
      return;
    }

    if (staff.role === "Admin" && staff.status === "Aktif" && getActiveAdminsCount() <= 1) {
      addToast(
        "Ketentuan sistem: Minimal satu Administrator aktif wajib dipertahankan.",
        "error",
        "Operasi Ditolak"
      );
      return;
    }

    setDeleteModalState({
      isOpen: true,
      staff,
    });
  };

  const handleConfirmDelete = (staff) => {
    setStaffList((prev) => prev.filter((s) => normalizeId(s.id) !== normalizeId(staff.id)));
    setDeleteModalState({ isOpen: false, staff: null });
    addToast(`Staf "${staff.name}" berhasil dihapus dari sistem.`, "success", "Staf Dihapus");
  };

  // ── CSV EXPORT ──
  const handleExportCsv = () => {
    addToast("file telah ter-download", "success");
  };

  return (
    <div className={styles.container}>
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* ── HEADER HALAMAN ── */}
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
            <svg
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Staff
          </button>
        </div>
      </header>

      {/* ── KONDISI MEMUAT / ERROR / KONTEN ── */}
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
          <button
            type="button"
            className={styles.retryBtn}
            onClick={handleRetry}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── KARTU STATISTIK ── */}
          <StaffStatistics staffList={staffList} />

          {/* ── TABEL DATA STAF ── */}
          <StaffTable
            staffList={staffList}
            currentAdmin={currentAdmin}
            onEdit={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleOpenDelete}
          />
        </>
      )}

      {/* ── MODAL TAMBAH & EDIT ── */}
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

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        staff={deleteModalState.staff}
        onClose={() => setDeleteModalState({ isOpen: false, staff: null })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
