import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./book-detail.module.css";

import LP from "../../../assets/books/LP.jpg";
import BM from "../../../assets/books/BM.jpg";
import DTL from "../../../assets/books/DTL.jpg";
import CL from "../../../assets/books/CL.jpg";
import AH from "../../../assets/books/AH.jpg";
import N5M from "../../../assets/books/N5M.jpg";
import surrounded from "../../../assets/books/surrounded.jpg";
import MRI from "../../../assets/books/MRI.jpg";
import ARW from "../../../assets/books/ARW.jpg";

/* ---------- DATA DETAIL BUKU ---------- */
const BOOKS_DATA = {
  1: {
    id: 1,
    title: "Laskar Pelangi",
    genre: "Fiksi Indonesia",
    year: "2005",
    author: "Andrea Hirata",
    publishDate: "1 September 2005",
    location: "Rak B-12, Lantai 2 (Fiksi Indonesia)",
    synopsis:
      "Kisah sepuluh anak dari keluarga sederhana di Belitung yang bersekolah di SD Muhammadiyah dengan segala keterbatasannya, namun tetap semangat meraih mimpi.",
    coverType: "image",
    coverSrc: LP,
  },
  2: {
    id: 2,
    title: "Bumi Manusia",
    genre: "Fiksi Sejarah",
    year: "1980",
    author: "Pramoedya Ananta Toer",
    publishDate: "25 Agustus 1980",
    location: "Rak B-05, Lantai 2 (Sastra Klasik)",
    synopsis:
      "Roman sejarah epik berlatar akhir abad ke-19 yang mengisahkan pergulatan batin dan pemikiran Minke, seorang anak bupati yang menempuh pendidikan di H.B.S. Surabaya di tengah feodalisme dan kolonialisme Hindia Belanda.",
    coverType: "image",
    coverSrc: BM,
  },
  3: {
    id: 3,
    title: "Di Tanah Lada",
    genre: "Fiksi Kontemporer",
    year: "2015",
    author: "Ziggy Zezsyazeoviennazabrizkie",
    publishDate: "10 November 2015",
    location: "Rak B-18, Lantai 2 (Fiksi Indonesia)",
    synopsis:
      "Kisah Salva (Ava) dan P bersahabat dalam kepolosan masa kecil menghadapi kenyataan hidup orang dewasa yang keras dan penuh luka.",
    coverType: "image",
    coverSrc: DTL,
  },
  4: {
    id: 4,
    title: "Antarmuka Digital",
    genre: "Sains & Rekayasa",
    year: "2023",
    author: "Prof. Maya Sari",
    publishDate: "15 Maret 2023",
    location: "Rak C-04, Lantai 3 (Teknologi & Desain)",
    synopsis:
      "Panduan komprehensif merancang antarmuka manusia-komputer modern berpusat pada pengguna, aksesibilitas, dan prinsip interaksi digital intuitif.",
    coverType: "graphic",
    graphicTheme: "themeAntarmuka",
    graphicTitle: ["ANTARMUKA", "DIGITAL"],
    graphicAuthor: "PROF. MAYA SARI",
  },
  5: {
    id: 5,
    title: "Surrounded by idiots",
    genre: "Psikologi & Komunikasi",
    year: "2019",
    author: "Thomas Erikson",
    publishDate: "30 Juli 2019",
    location: "Rak A-08, Lantai 1 (Pengembangan Diri)",
    synopsis:
      "Buku pengantar memahami empat tipe kepribadian manusia (Merah, Kuning, Hijau, Biru) guna membangun komunikasi yang lebih efektif dan empati yang mendalam.",
    coverType: "image",
    coverSrc: surrounded,
  },
  6: {
    id: 6,
    title: "Sistem Otomasi",
    genre: "Sains & Rekayasa",
    year: "2022",
    author: "Dr. Rizky Pratama",
    publishDate: "12 Januari 2022",
    location: "Rak C-11, Lantai 3 (Robotika & Otomasi)",
    synopsis:
      "Membahas arsitektur kontrol otomasi industri modern berbasis PLC, IoT, sistem kendali terdistribusi, serta integrasi kecerdasan buatan dalam manufaktur.",
    coverType: "graphic",
    graphicTheme: "themeOtomasi",
    graphicTitle: ["SISTEM", "OTOMASI"],
    graphicAuthor: "DR. RIZKY PRATAMA",
  },
  7: {
    id: 7,
    title: "Mirai",
    genre: "Fiksi & Sastra",
    year: "2018",
    author: "Mamoru Hosoda",
    publishDate: "20 Juli 2018",
    location: "Rak B-22, Lantai 2 (Fiksi Terjemahan)",
    synopsis:
      "Kisah hangat seorang bocah laki-laki berusia empat tahun bernama Kun yang bertualang melintasi waktu bersama adik perempuannya yang datang dari masa depan.",
    coverType: "image",
    coverSrc: MRI,
  },
  8: {
    id: 8,
    title: "Desain UX",
    genre: "AI & Komputer",
    year: "2024",
    author: "Arya Wardhana, Ph.D.",
    publishDate: "14 Februari 2024",
    location: "Rak C-02, Lantai 3 (Desain Digital)",
    synopsis:
      "Eksplorasi mendalam metode riset pengguna, wireframing, usability testing, micro-interactions, dan arsitektur informasi pada produk digital modern.",
    coverType: "graphic",
    graphicTheme: "themeUX",
    graphicTitle: ["DESAIN", "UX"],
    graphicAuthor: "ARYA WARDHANA, PH.D.",
  },
  9: {
    id: 9,
    title: "Art of Wars",
    genre: "Filosofi & Refleksi",
    year: "2016",
    author: "Sun Tzu",
    publishDate: "5 Mei 2016",
    location: "Rak A-15, Lantai 1 (Filosofi & Taktik)",
    synopsis:
      "Risalah strategi militer klasik Tiongkok kuno yang mengajarkan seni kepemimpinan, kalkulasi cermat, dan penyelesaian konflik tanpa pertumpahan darah.",
    coverType: "image",
    coverSrc: ARW,
  },
  10: {
    id: 10,
    title: "Sang Pemimpi",
    genre: "Fiksi & Sastra",
    year: "2006",
    author: "Andrea Hirata",
    publishDate: "1 Juli 2006",
    location: "Rak B-13, Lantai 2 (Fiksi Indonesia)",
    synopsis:
      "Sekuel Laskar Pelangi menceritakan masa remaja Ikal, Arai, dan Jimbron yang gigih mengejar cita-cita menuntut ilmu hingga ke Universitas Sorbonne di Paris.",
    coverType: "graphic",
    graphicTheme: "themePemimpi",
    graphicTitle: ["SANG", "PEMIMPI"],
    graphicAuthor: "ANDREA HIRATA",
  },
  11: {
    id: 11,
    title: "Negeri 5 Menara",
    genre: "Fiksi Inspiratif",
    year: "2009",
    author: "A. Fuadi",
    publishDate: "1 Juli 2009",
    location: "Rak B-14, Lantai 2 (Fiksi Inspiratif)",
    synopsis:
      "Perjalanan Alif dan kelima sahabatnya di Pondok Madani dengan semboyan 'Man Jadda Wajada' dalam menuntut ilmu dan menggapai impian besar mereka.",
    coverType: "image",
    coverSrc: N5M,
  },
  12: {
    id: 12,
    title: "Cantik itu Luka",
    genre: "Sastra Indonesia",
    year: "2002",
    author: "Eka Kurniawan",
    publishDate: "1 Oktober 2002",
    location: "Rak B-09, Lantai 2 (Sastra Indonesia)",
    synopsis:
      "Epos realisme magis tentang Dewi Ayu dan keluarganya berlatar sejarah pergolakan kolonialisme, pendudukan, dan kemerdekaan di Halimunda.",
    coverType: "image",
    coverSrc: CL,
  },
  13: {
    id: 13,
    title: "Atomic Habits",
    genre: "Pengembangan Diri",
    year: "2018",
    author: "James Clear",
    publishDate: "16 Oktober 2018",
    location: "Rak A-02, Lantai 1 (Pengembangan Diri)",
    synopsis:
      "Panduan praktis dan terbukti untuk membangun kebiasaan baik serta memutus kebiasaan buruk dengan memanfaatkan kekuatan perubahan kecil 1% setiap hari.",
    coverType: "image",
    coverSrc: AH,
  },
};

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

  // Ambil data buku berdasarkan ID dari URL, default ke ID 1 (Laskar Pelangi) jika tidak ditemukan
  const book = BOOKS_DATA[id] || BOOKS_DATA[1];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
              {book.coverType === "image" && book.coverSrc ? (
                <img
                  className={styles.coverImg}
                  src={book.coverSrc}
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
