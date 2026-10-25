import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./homepage.module.css";

import LP from "../../../assets/books/LP.jpg";
import BM from "../../../assets/books/BM.jpg";
import N5M from "../../../assets/books/N5M.jpg";
import CL from "../../../assets/books/CL.jpg";
import AH from "../../../assets/books/AH.jpg";

import news1 from "../../../assets/news/news1.png";
import news2 from "../../../assets/news/news2.png";
import news3 from "../../../assets/news/news3.png";
import news4 from "../../../assets/news/news4.png";

/* ---------- DATA (ganti dengan data dari API nantinya) ---------- */
const CATEGORIES = [
  "Semua Koleksi",
  "Fiksi & Sastra",
  "Sains & Rekayasa",
  "Filosofi & Refleksi",
  "AI & Komputer",
  "Jurnal Ilmiah",
];

// cover: isi dengan import gambar, mis. import laskar from "../../../assets/laskar-pelangi.jpg"
const BOOKS = [
  { id: 1, title: "Laskar Pelangi", author: "Andrea Hirata", category: "Fiksi & Sastra", cover: LP, from: "#7c3aed", to: "#f97316" },
  { id: 2, title: "Bumi Manusia", author: "Pramoedya Ananta Toer", category: "Fiksi & Sastra", cover: BM, from: "#a16207", to: "#166534" },
  { id: 11, title: "Negeri 5 Menara", author: "A. Fuadi", category: "Fiksi & Sastra", cover: N5M, from: "#ea580c", to: "#7c2d12" },
  { id: 12, title: "Cantik itu Luka", author: "Eka Kurniawan", category: "Fiksi & Sastra", cover: CL, from: "#be123c", to: "#fda4af" },
  { id: 13, title: "Atomic Habits", author: "James Clear", category: "Self Help", cover: AH, from: "#f8fafc", to: "#e2e8f0", dark: true },
];

const EVENTS = [
  {
    id: 1,
    date: "24 OKT • 14:00 WIB",
    badge: "Hybrid",
    tag: "BEDAH SASTRA",
    meta: "18 Kuota Tersisa",
    title: "Menulis Nasional Cerpen, Sastra",
    desc: "Telaah kritis manuskrip sastra klasik bersama kurator naskah kuno.",
    action: { type: "button", label: "Daftar", primary: true },
    image: news1,
  },
  {
    id: 2,
    date: "28 OKT • 09:30 WIB",
    badge: "Offline",
    tag: "LOKAKARYA",
    meta: "Gratis • Anggota",
    title: "Buku Terlaris Bula ini",
    desc: "Membangun narasi legenda Nusantara dengan perspektif fiksi kontemporer.",
    action: { type: "button", label: "Detail" },
    image: news2,
  },
  {
    id: 3,
    date: "18 OKT 2024",
    badge: "Fasilitas",
    tag: "INOVASI LAYANAN",
    meta: "3 min read",
    title: "Athenaeum Digital Resmikan Smart Kiosk & Silent Booth",
    desc: "Ruang baca mandiri berinsulasi suara tinggi dan peminjaman buku nirsentuh.",
    action: { type: "link", label: "Baca Selengkapnya" },
    image: news3,
  },
  {
    id: 4,
    date: "15 OKT 2024",
    badge: "Akademik",
    tag: "KEMITRAAN RISET",
    meta: "5 min read",
    title: "Kemitraan Jurnal Antar-Universitas: Akses Bebas Riset",
    desc: "Kolaborasi bersama konsorsium perpustakaan nasional membuka 50.000 naskah.",
    footerText: "Warta Riset",
    action: { type: "link", label: "Baca Selengkapnya" },
    image: news4,
  },
];

/* ---------- ICONS ---------- */
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

/* ---------- SUB COMPONENTS ---------- */
function BookCover({ book }) {
  if (book.cover) {
    return <img className={styles.coverImg} src={book.cover} alt={`Sampul ${book.title}`} />;
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
  return (
    <article className={styles.eventCard}>
      <div className={styles.eventMedia}>
        {event.image ? (
          <img src={event.image} alt={event.title} />
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

/* ---------- PAGE ---------- */
export default function Homepage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [view, setView] = useState("grid");

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const a = author.trim().toLowerCase();
    return BOOKS.filter((b) => {
      const matchCategory = category === CATEGORIES[0] || b.category === category;
      const matchQuery = !q || b.title.toLowerCase().includes(q);
      const matchAuthor = !a || b.author.toLowerCase().includes(a);
      return matchCategory && matchQuery && matchAuthor;
    });
  }, [query, author, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (author.trim()) params.set("author", author.trim());
    if (category && category !== CATEGORIES[0]) params.set("category", category);
    navigate(`/catalog${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Explore Our Collections</h1>
          <p className={styles.heroSub}>
            Jelajahi 42.850+ pustaka fisik, naskah riset langka, dan e-book interaktif.
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>TOTAL KOLEKSI</span>
            <span className={styles.statValue}>42.850 Buku</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statLabel}>TOTAL JUDUL</span>
            <span className={styles.statValue}>38.120 Judul</span>
          </div>
        </div>
      </section>

      {/* SEARCH PANEL */}
      <section className={styles.searchPanel}>
        <form onSubmit={handleSearchSubmit}>
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
            <button
              type="submit"
              style={{
                height: "46px",
                padding: "0 22px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#00b4d8",
                color: "#071526",
                border: 0,
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <SearchIcon />
              Cari Buku
            </button>
          </div>
        </form>

        <div className={styles.categoryRow}>
          <span className={styles.categoryLabel}>KATEGORI:</span>
          <div className={styles.chips}>
            {CATEGORIES.map((c) => (
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

      {/* LATEST CATALOG */}
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

      {/* EVENT & NEWS */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Event &amp; News</h2>
        </div>
        <div className={styles.eventGrid}>
          {EVENTS.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </section>
    </main>
  );
}