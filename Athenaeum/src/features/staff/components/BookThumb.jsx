import styles from "./BookThumb.module.css";
import { coverSrc } from "../loanUtils";

/*
 * Thumbnail cover buku. Memakai gambar cover dari books.json (field `cover`)
 * dan jatuh ke kotak berwarna berisi huruf awal judul jika gambar tidak ada.
 *
 * Props: book, width (px), height (px)
 */
export default function BookThumb({ book, width = 36, height = 46 }) {
  const src = coverSrc(book);
  const size = { width, height };

  if (src) {
    return <img className={styles.thumb} src={src} alt="" style={size} loading="lazy" />;
  }
  return (
    <span
      className={`${styles.thumb} ${styles.fallback}`}
      style={{ ...size, background: `linear-gradient(135deg, ${book?.from ?? "#2563eb"}, ${book?.to ?? "#1e3a8a"})` }}
      aria-hidden="true"
    >
      {book?.title?.[0] ?? "?"}
    </span>
  );
}
