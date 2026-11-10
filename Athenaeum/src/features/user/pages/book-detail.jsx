import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./book-detail.module.css";

import { useFetch } from "../../../hooks/useFetch";
import DataState from "../../../components/DataState";
import { getBooks } from "../../../api/library";
import { COVERS } from "../../../assets/images";

/* ---------- GRAPHIC SVG PATTERN HELPER ---------- */
function GraphicSvgPattern({ theme }) {
  if (theme === "themeAntarmuka") {
    return (
      <svg viewBox="0 0 200 280" className={styles.graphicCoverSvg} preserveAspectRatio="none">
        <circle cx="170" cy="60" r="45" fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeOpacity="0.4" />
        <circle cx="170" cy="60" r="80" fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeOpacity="0.25" />
        <circle cx="170" cy="60" r="120" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.15" />
      </svg>
    );
  }
  if (theme === "themeOtomasi") {
    return (
      <svg viewBox="0 0 200 280" className={styles.graphicCoverSvg} preserveAspectRatio="none">
        <path d="M 60 0 C 90 60, 150 70, 200 60" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeOpacity="0.35" />
        <path d="M 80 0 C 110 80, 160 90, 200 80" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeOpacity="0.28" />
        <path d="M 100 0 C 130 100, 170 110, 200 100" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeOpacity="0.2" />
        <path d="M 120 0 C 150 120, 180 130, 200 120" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeOpacity="0.12" />
      </svg>
    );
  }
  if (theme === "themeUX") {
    return (
      <svg viewBox="0 0 200 280" className={styles.graphicCoverSvg} preserveAspectRatio="none">
        <rect x="20" y="20" width="160" height="240" rx="8" fill="none" stroke="#fb7185" strokeWidth="1.2" strokeOpacity="0.3" />
        <circle cx="100" cy="140" r="45" fill="none" stroke="#fb7185" strokeWidth="1.2" strokeOpacity="0.25" />
      </svg>
    );
  }
  if (theme === "themePemimpi") {
    return (
      <svg viewBox="0 0 200 280" className={styles.graphicCoverSvg} preserveAspectRatio="none">
        <circle cx="180" cy="220" r="40" fill="none" stroke="#2dd4bf" strokeWidth="1.2" strokeOpacity="0.4" />
        <circle cx="180" cy="220" r="75" fill="none" stroke="#2dd4bf" strokeWidth="1.2" strokeOpacity="0.25" />
        <circle cx="180" cy="220" r="115" fill="none" stroke="#2dd4bf" strokeWidth="1" strokeOpacity="0.15" />
      </svg>
    );
  }
  return null;
}

export default function BookDetail() {
  const { id } = useParams();

  // Data diambil lewat fetch() dari public/data/books.json
  const { data: books, loading, error, reload } = useFetch(getBooks);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading || error) {
    return (
      <div className={styles.page}>
        <main className={styles.contentWrapper}>
          <DataState loading={loading} error={error} onRetry={reload} label="Memuat detail buku..." />
        </main>
      </div>
    );
  }

  // Cari buku berdasarkan ID dari URL
  const book = books.find((b) => String(b.id) === id);

  if (!book) {
    return (
      <div className={styles.page}>
        <main className={styles.contentWrapper}>
          <Link to="/catalog" className={styles.backLink}>
            <span>Kembali ke Katalog</span>
          </Link>
          <DataState title="Buku tidak ditemukan" error={new Error(`Tidak ada buku dengan ID "${id}".`)} />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.contentWrapper}>
        <Link to="/catalog" className={styles.backLink}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Kembali ke Katalog</span>
        </Link>

        <section className={styles.bookLayout}>
          {/* KOLOM KIRI: SAMPUL BUKU */}
          <div className={styles.coverColumn}>
            <div className={styles.coverCard}>
              {book.coverType === "image" && COVERS[book.cover] ? (
                <img
                  className={styles.coverImg}
                  src={COVERS[book.cover]}
                  alt={`Sampul ${book.title}`}
                />
              ) : book.coverType === "graphic" ? (
                <div className={`${styles.graphicCover} ${styles[book.graphicTheme] || ""}`}>
                  <GraphicSvgPattern theme={book.graphicTheme} />
                  <div className={styles.graphicDash} />
                  <h3 className={styles.graphicTitle}>
                    {book.graphicTitle?.map((part, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {part}
                      </span>
                    ))}
                  </h3>
                  <p className={styles.graphicAuthor}>{book.graphicAuthor}</p>
                </div>
              ) : (
                <div className={styles.coverFallback}>
                  <strong>{book.title}</strong>
                  <span>{book.author}</span>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: DETAIL INFORMASI BUKU */}
          <div className={styles.detailsColumn}>
            <h1 className={styles.title}>{book.title}</h1>
            <p className={styles.categoryYear}>
              {book.genre} | {book.year}
            </p>

            <div className={styles.metaList}>
              <p className={styles.metaItem}>
                <span className={styles.metaLabel}>Penulis</span>
                <strong className={styles.metaValue}>{book.author}</strong>
                <span className={styles.metaDot}>.</span>
                <span className={styles.metaLabel}>Terbit</span>
                <strong className={styles.metaValue}>{book.publishDate}</strong>
              </p>
              <p className={styles.metaItem}>
                <span className={styles.metaLabel}>Lokasi Rak</span>
                <strong className={styles.metaValue}>{book.location}</strong>
              </p>
            </div>

            <div className={styles.sinopsisSection}>
              <h2 className={styles.sinopsisTitle}>Sinopsis</h2>
              <p className={styles.sinopsisText}>{book.synopsis}</p>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.readBtn}
              >
                Baca E book
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        @ 2026 Athenaeum Digital
      </footer>
    </div>
  );
}
