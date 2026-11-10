// src/features/admin/staff/Toast.jsx
import { useEffect } from "react";
import styles from "./Toast.module.css";

export default function Toast({ toasts, onDismiss }) {
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => {
        onDismiss(t.id);
      }, t.duration || 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  if (!toasts.length) return null;

  return (
    <div className={styles.toastContainer} role="region" aria-label="Notifikasi">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type] || styles.info}`}
          role="alert"
        >
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
      ))}
    </div>
  );
}
