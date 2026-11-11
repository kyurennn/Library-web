import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./homepage.module.css";

import { useFetch } from "../../../hooks/useFetch";
import DataState from "../../../components/DataState";
import { getBooks, getEvents, getLibrary } from "../../../api/library";
import { COVERS, NEWS_IMAGES } from "../../../assets/images";

const ALL_CATEGORY = "Semua Koleksi";
const nf = new Intl.NumberFormat("id-ID");

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M9 4v16" />
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

function BookCover({ book }) {
  const src = COVERS[book.cover];
  if (src) {
    return <img className={styles.coverImg} src={src} alt={`Sampul ${book.title}`} />;
  }
  return (
    <div
      className={styles.coverFallback}
      style={{
        background: `linear-gradient(160deg, ${book.from}, ${book.to})`,
        color: book.dark ? "#0f172a" : "#fff",
      }}
    >
      <strong>{book.title}</strong>
      <span>{book.author}</span>
    </div>
  );
}

function EventCard({ event }) {
  const image = NEWS_IMAGES[event.image];
  return (
    <article className={styles.eventCard}>
      <div className={styles.eventMedia}>
        {image ? (
          <img src={image} alt={event.title} />
        ) : (
          <div className={styles.eventMediaFallback} />
        )}
        <span className={styles.eventDate}>{event.date}</span>
        <span className={styles.eventBadge}>{event.badge}</span>
      </div>

      <div className={styles.eventBody}>
        <div className={styles.eventMetaRow}>
          <span className={styles.eventTag}>{event.tag}</span>
          <span className={styles.eventMeta}>{event.meta}</span>
        </div>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <p className={styles.eventDesc}>{event.desc}</p>

        <div className={styles.eventFooter}>
          {event.footerText ? <span className={styles.eventFooterText}>{event.footerText}</span> : <span />}
          {event.action.type === "button" ? (
            <button
              type="button"
              className={`${styles.eventBtn} ${event.action.primary ? styles.eventBtnPrimary : ""}`}
            >
              {event.action.label}
            </button>
          ) : (
            <a href="#" className={styles.readMore}>
              {event.action.label} <ChevronIcon />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Homepage() {
  const navigate = useNavigate();

  // Data diambil lewat fetch() dari public/data/*.json
  const booksReq = useFetch(getBooks);
  const eventsReq = useFetch(getEvents);
  const libraryReq = useFetch(getLibrary);

  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [view, setView] = useState("grid");

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const a = author.trim().toLowerCase();
    return (booksReq.data ?? []).filter((b) => {
      if (!b.featured) return false;
      const matchCategory = category === ALL_CATEGORY || b.category === category;
      const matchQuery = !q || b.title.toLowerCase().includes(q);
      const matchAuthor = !a || b.author.toLowerCase().includes(a);
      return matchCategory && matchQuery && matchAuthor;
    });
  }, [booksReq.data, query, author, category]);

  const loading = booksReq.loading || eventsReq.loading || libraryReq.loading;
  const error = booksReq.error || eventsReq.error || libraryReq.error;

  if (loading || error) {
    return (
      <main className={styles.page}>
        <DataState
          loading={loading}
          error={error}
          label="Memuat koleksi..."
          onRetry={() => {
            booksReq.reload();
            eventsReq.reload();
            libraryReq.reload();
          }}
        />
      </main>
    );
  }

  const { categories, stats } = libraryReq.data;
  const events = eventsReq.data;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (author.trim()) params.set("author", author.trim());
    if (category && category !== ALL_CATEGORY) params.set("category", category);
    navigate(`/catalog${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Explore Our Collections</h1>
          <p className={styles.heroSub}>
            Jelajahi {nf.format(stats.totalCollection)}+ pustaka fisik, naskah riset langka, dan e-book interaktif.
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>TOTAL KOLEKSI</span>
            <span className={styles.statValue}>{nf.format(stats.totalCollection)} Buku</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statLabel}>TOTAL JUDUL</span>
            <span className={styles.statValue}>{nf.format(stats.totalTitles)} Judul</span>
          </div>
        </div>
      </section>

      <section className={styles.searchPanel}>
        <form onSubmit={handleSearchSubmit}>
        </form>
        <div className={styles.searchRow}>
          <label className={`${styles.input} ${styles.inputGrow}`}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Cari Judul Buku, Topik, atau Kata Kunci..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className={`${styles.input} ${styles.inputAuthor}`}>
            <UserIcon />
            <input
              type="text"
              placeholder="Nama Penulis..."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.categoryRow}>
          <span className={styles.categoryLabel}>KATEGORI:</span>
          <div className={styles.chips}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.chip} ${c === category ? styles.chipActive : ""}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Latest Catalog</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              to="/catalog"
              style={{
                color: "#22d3ee",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Lihat Semua Katalog <ChevronIcon />
            </Link>
            <div className={styles.viewToggle}>
              <button
                type="button"
                aria-label="Tampilan grid"
                className={view === "grid" ? styles.viewActive : ""}
                onClick={() => setView("grid")}
              >
                <GridIcon />
              </button>
              <button
                type="button"
                aria-label="Tampilan list"
                className={view === "list" ? styles.viewActive : ""}
                onClick={() => setView("list")}
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <p className={styles.empty}>Tidak ada buku yang cocok dengan pencarian Anda.</p>
        ) : (
          <div className={view === "grid" ? styles.bookGrid : styles.bookList}>
            {filteredBooks.map((book) => (
              <Link key={book.id} to={`/catalog/${book.id}`} className={styles.bookCard}>
                <div className={styles.coverWrap}>
                  <BookCover book={book} />
                </div>
                <div className={styles.bookInfo}>
                  <span className={styles.bookCategory}>{book.category.toUpperCase()}</span>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  {view === "list" && <p className={styles.bookAuthor}>{book.author}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>


      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Event &amp; News</h2>
        </div>
        <div className={styles.eventGrid}>
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </section>
    </main>
  );
}