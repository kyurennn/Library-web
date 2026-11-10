import styles from "./DataState.module.css";

/**
 * Tampilan sementara saat data sedang dimuat atau gagal dimuat.
 *   <DataState loading={loading} error={error} onRetry={reload} />
 */
export default function DataState({ loading, error, onRetry, label = "Memuat data...", title = "Data gagal dimuat" }) {
  if (error) {
    return (
      <div className={styles.box} role="alert">
        <p className={styles.title}>{title}</p>
        <p className={styles.text}>{error.message}</p>
        {onRetry && (
          <button type="button" className={styles.btn} onClick={onRetry}>
            Coba lagi
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.box} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p className={styles.text}>{label}</p>
      </div>
    );
  }

  return null;
}
