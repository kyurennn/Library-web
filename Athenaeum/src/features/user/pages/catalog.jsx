import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import styles from "./catalog.module.css";

import LP from "../../../assets/books/LP.jpg";
import BM from "../../../assets/books/BM.jpg";
import tanahLadaCover from "../../../assets/books/DTL.jpg";
import surroundedCover from "../../../assets/books/surrounded.jpg";
import miraiCover from "../../../assets/books/MRI.jpg";
import meditationsCover from "../../../assets/books/ARW.jpg";

/* ---------- KATEGORI FILTER ---------- */
const CATEGORIES = [
  "Semua Koleksi",
  "Fiksi & Sastra",
  "Sains & Rekayasa",
  "Filosofi & Refleksi",
  "AI & Komputer",
  "Jurnal Ilmiah",
];

/* ---------- DATA 10 BUKU KATALOG (SESUAI DOKUMEN & MOCKUP) ---------- */
const CATALOG_BOOKS = [
  {
    id: 1,
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    category: "Fiksi & Sastra",
    tag: "FIKSI & SASTRA",
    coverType: "image",
    coverSrc: LP,
  },
  {
    id: 2,
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    category: "Fiksi & Sastra",
    tag: "FIKSI & SASTRA",
    coverType: "image",
    coverSrc: BM,
  },
  {
    id: 3,
    title: "Di Tanah Lada",
    author: "Ziggy Zezsyazeoviennazabrizkie",
    category: "Fiksi & Sastra",
    tag: "AI & KOMPUTER",
    coverType: "image",
    coverSrc: tanahLadaCover,
  },
  {
    id: 4,
    title: "Antarmuka Digital",
    author: "Prof. Maya Sari",
    category: "Sains & Rekayasa",
    tag: "SAINS & REKAYASA",
    coverType: "graphic",
    graphicTheme: "themeAntarmuka",
    graphicTitle: ["ANTARMUKA", "DIGITAL"],
    graphicAuthor: "PROF. MAYA SARI",
  },
  {
    id: 5,
    title: "Surrounded by idiots",
    author: "Thomas Erikson",
    category: "Filosofi & Refleksi",
    tag: "SAINS & REKAYASA",
    coverType: "image",
    coverSrc: surroundedCover,
  },
  {
    id: 6,
    title: "Sistem Otomasi",
    author: "Dr. Rizky Pratama",
    category: "Sains & Rekayasa",
    tag: "SAINS & REKAYASA",
    coverType: "graphic",
    graphicTheme: "themeOtomasi",
    graphicTitle: ["SISTEM", "OTOMASI"],
    graphicAuthor: "DR. RIZKY PRATAMA",
  },
  {
    id: 7,
    title: "Mirai",
    author: "Mamoru Hosoda",
    category: "Fiksi & Sastra",
    tag: "SAINS & REKAYASA",
    coverType: "image",
    coverSrc: miraiCover,
  },
  {
    id: 8,
    title: "Desain UX",
    author: "Arya Wardhana, Ph.D.",
    category: "AI & Komputer",
    tag: "AI & KOMPUTER",
    coverType: "graphic",
    graphicTheme: "themeUX",
    graphicTitle: ["DESAIN", "UX"],
    graphicAuthor: "ARYA WARDHANA, PH.D.",
  },
  {
    id: 9,
    title: "Art of Wars",
    author: "Sun Tzu",
    category: "Filosofi & Refleksi",
    tag: "FILOSOFI & REFLEKSI",
    coverType: "image",
    coverSrc: meditationsCover,
  },
  {
    id: 10,
    title: "Sang Pemimpi",
    author: "Andrea Hirata",
    category: "Fiksi & Sastra",
    tag: "FIKSI & SASTRA",
    coverType: "graphic",
    graphicTheme: "themePemimpi",
    graphicTitle: ["SANG", "PEMIMPI"],
    graphicAuthor: "ANDREA HIRATA",
  },
];

/* ---------- ICONS ---------- */
const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const UserIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/* ---------- GRAPHIC COVER SVG PATTERNS ---------- */
function GraphicSvgPattern({ theme }) {
  if (theme === "themeBumiManusia") {
    return (
      <svg viewBox="0 0 200 280" className={styles.graphicCoverSvg} preserveAspectRatio="none">
        <circle cx="180" cy="50" r="40" fill="none" stroke="#cca352" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="180" cy="50" r="70" fill="none" stroke="#cca352" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="180" cy="50" r="105" fill="none" stroke="#cca352" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="180" cy="50" r="145" fill="none" stroke="#cca352" strokeWidth="1" strokeOpacity="0.12" />
      </svg>
    );
  }
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
        <path d="M 120 0 C 150 120, 180 130, 200 120" fill="none" stroke="#c084fc" strokeWidth="1" strokeOpacity="0.12" />
      </svg>
    );
  }
  if (theme === "themeUX") {
    return (
      <svg viewBox="0 0 200 280" className={styles.graphicCoverSvg} preserveAspectRatio="none">
        <circle cx="175" cy="55" r="35" fill="none" stroke="#fb7185" strokeWidth="1.2" strokeOpacity="0.4" />
        <circle cx="175" cy="55" r="65" fill="none" stroke="#fb7185" strokeWidth="1.2" strokeOpacity="0.3" />
        <circle cx="175" cy="55" r="95" fill="none" stroke="#fb7185" strokeWidth="1.2" strokeOpacity="0.2" />
        <circle cx="175" cy="55" r="130" fill="none" stroke="#fb7185" strokeWidth="1" strokeOpacity="0.12" />
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

/* ---------- COVER RENDERER ---------- */
function CatalogCover({ book }) {
  if (book.coverType === "image" && book.coverSrc) {
    return <img className={styles.coverImg} src={book.coverSrc} alt={`Sampul ${book.title}`} />;
  }

  if (book.coverType === "graphic") {
    const themeClass = styles[book.graphicTheme] || "";
    return (
      <div className={`${styles.graphicCover} ${themeClass}`}>
        <GraphicSvgPattern theme={book.graphicTheme} />
        <div className={styles.graphicDash} />
        <h4 className={styles.graphicTitle}>
          {book.graphicTitle.map((part, i) => (
            <span key={i} style={{ display: "block" }}>
              {part}
            </span>
          ))}
        </h4>
        <p className={styles.graphicAuthor}>{book.graphicAuthor}</p>
      </div>
    );
  }

  return null;
}

/* ---------- HALAMAN KATALOG UTAMA ---------- */
export default function Catalog() {
  const [searchParams] = useSearchParams();

  // Inisialisasi state pencarian dari query URL jika ada (misal dari navigasi homepage)
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [author, setAuthor] = useState(searchParams.get("author") || "");
  const [category, setCategory] = useState(searchParams.get("category") || CATEGORIES[0]);
  const [sortBy, setSortBy] = useState("terbaru");
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  // Filter buku berdasarkan input pencarian, penulis, dan kategori
  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const a = author.trim().toLowerCase();

    let list = CATALOG_BOOKS.filter((b) => {
      const matchCategory = category === CATEGORIES[0] || b.category.toLowerCase() === category.toLowerCase();
      const matchQuery = !q || b.title.toLowerCase().includes(q) || b.tag.toLowerCase().includes(q);
      const matchAuthor = !a || b.author.toLowerCase().includes(a);
      return matchCategory && matchQuery && matchAuthor;
    });

    // Urutkan buku sesuai pilihan sortBy
    if (sortBy === "az") {
      list.sort((x, y) => x.title.localeCompare(y.title));
    } else if (sortBy === "za") {
      list.sort((x, y) => y.title.localeCompare(x.title));
    } else if (sortBy === "author") {
      list.sort((x, y) => x.author.localeCompare(y.author));
    }

    return list;
  }, [query, author, category, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= 3812) {
      setCurrentPage(newPage);
      setPageInput(String(newPage));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageInputBlur = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 3812) {
      setCurrentPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  return (
    <main className={styles.page}>
      {/* 1. HERO & STATISTIK KOLEKSI */}
      <section className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Library Catalog</h1>
          <p className={styles.heroSub}>
            Temukan buku lewat judul, penulis, kategori, atau nomor ISBN.
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
            <span className={styles.statValueAlt}>38.120 Judul</span>
          </div>
        </div>
      </section>

      {/* 2. PANEL PENCARIAN & KATEGORI */}
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

            <button type="submit" className={styles.searchBtn}>
              <SearchIcon size={18} />
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

      {/* 3. INFO HASIL & KONTROL TAMPILAN */}
      <section className={styles.resultsBar}>
        <p className={styles.resultsCount}>
          Menampilkan <strong>{filteredBooks.length > 0 ? `1–${filteredBooks.length}` : "0"}</strong> dari{" "}
          <strong>{category === "Semua Koleksi" && !query && !author ? "38.120" : filteredBooks.length}</strong> judul koleksi
        </p>

        <div className={styles.controls}>
          <div className={styles.sortWrapper}>
            <span className={styles.sortLabel}>URUTKAN:</span>
            <div className={styles.selectContainer}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="terbaru">Terbaru Ditambahkan</option>
                <option value="terpopuler">Terpopuler</option>
                <option value="az">Judul (A-Z)</option>
                <option value="za">Judul (Z-A)</option>
                <option value="author">Penulis (A-Z)</option>
              </select>
              <span className={styles.selectChevron}>
                <ChevronDownIcon />
              </span>
            </div>
          </div>

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
      </section>

      {/* 4. DAFTAR BUKU (GRID / LIST VIEW) */}
      {filteredBooks.length === 0 ? (
        <div className={styles.empty}>
          <p>Tidak ada buku yang sesuai dengan pencarian Anda.</p>
        </div>
      ) : (
        <div className={view === "grid" ? styles.bookGrid : styles.bookList}>
          {filteredBooks.map((book) => (
            <Link key={book.id} to={`/catalog/${book.id}`} className={styles.bookCard}>
              <div className={styles.coverWrap}>
                <CatalogCover book={book} />
              </div>
              <div className={styles.bookInfo}>
                <span className={styles.bookCategory}>{book.tag}</span>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <p className={styles.bookAuthor}>{book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 5. PAGINASI */}
      <section className={styles.paginationBar}>
        <div className={styles.pageIndicator}>
          <span>Halaman</span>
          <input
            type="text"
            className={styles.pageInput}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePageInputBlur();
            }}
          />
          <span>dari 3.812 halaman</span>
        </div>

        <div className={styles.pageNav}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeftIcon />
          </button>

          <button
            type="button"
            className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageBtnActive : ""}`}
            onClick={() => handlePageChange(1)}
          >
            1
          </button>

          <button
            type="button"
            className={`${styles.pageBtn} ${currentPage === 2 ? styles.pageBtnActive : ""}`}
            onClick={() => handlePageChange(2)}
          >
            2
          </button>

          <button
            type="button"
            className={`${styles.pageBtn} ${currentPage === 3 ? styles.pageBtnActive : ""}`}
            onClick={() => handlePageChange(3)}
          >
            3
          </button>

          <span className={styles.pageDots}>...</span>

          <button
            type="button"
            className={`${styles.pageBtn} ${currentPage === 3812 ? styles.pageBtnActive : ""}`}
            onClick={() => handlePageChange(3812)}
          >
            3.812
          </button>

          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= 3812}
            aria-label="Halaman berikutnya"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </section>
    </main>
  );
}
