import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./book-manager.module.css";
import initialBooksData from "../../../../public/data/books.json";
import { COVERS } from "../../../assets/images";

// Format data dari books.json agar memiliki cover dan field yang seragam
export const INITIAL_BOOKS = initialBooksData.map((b) => ({
  id: b.id,
  title: b.title,
  author: b.author,
  year: b.year || "2024",
  shelf: b.location ? b.location.split(",")[0].trim() : "Rak A-01",
  category: b.category || "Fiksi & Sastra",
  status: "tersedia",
  cover: COVERS[b.cover] || COVERS.LP,
}));

// Array data statis di memori
let adminBooks = [...INITIAL_BOOKS];

export function getAdminBooks() {
  return adminBooks;
}

export function updateAdminBook(updatedBook) {
  adminBooks = adminBooks.map((b) =>
    String(b.id) === String(updatedBook.id) ? { ...b, ...updatedBook } : b
  );
  return adminBooks;
}

function getInitials(text) {
  if (!text) return "BK";
  const words = text.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function BookManager() {
  const navigate = useNavigate();
  const [books, setBooks] = useState(() => getAdminBooks());
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states: 'add' | 'delete' | 'detail' | null
  const [modal, setModal] = useState({ type: null, book: null });

  // Form states untuk Tambah Buku
  const [formValues, setFormValues] = useState({
    title: "",
    author: "",
    year: "",
    shelf: "",
    category: "fiksi",
    status: "tersedia",
  });

  // Filter pencarian buku
  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.shelf.toLowerCase().includes(q) ||
        b.year.toLowerCase().includes(q)
    );
  }, [books, searchTerm]);

  // Buka Modal Tambah Buku
  const handleOpenAdd = () => {
    setFormValues({
      title: "",
      author: "",
      year: new Date().getFullYear().toString(),
      shelf: "A-01",
      category: "fiksi",
      status: "tersedia",
    });
    setModal({ type: "add", book: null });
  };

  // Navigasi ke Halaman Edit Buku
  const handleGoToEdit = (book) => {
    navigate(`/admin/books/edit/${book.id}`, { state: { book } });
  };

  // Buka Modal Hapus
  const handleOpenDelete = (book) => {
    setModal({ type: "delete", book });
  };

  // Buka Modal Detail
  const handleOpenDetail = (book) => {
    setModal({ type: "detail", book });
  };

  // Tutup Modal
  const handleCloseModal = () => {
    setModal({ type: null, book: null });
  };

  // Simpan Tambah Buku Baru
  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!formValues.title.trim()) return;

    const newBook = {
      id: Date.now(),
      title: formValues.title.trim(),
      author: formValues.author.trim() || "Penulis Anonim",
      year: formValues.year.trim() || new Date().getFullYear().toString(),
      shelf: formValues.shelf.trim() || "A-01",
      category: formValues.category,
      status: formValues.status,
      cover: LP,
    };

    adminBooks = [newBook, ...adminBooks];
    setBooks(adminBooks);
    handleCloseModal();
  };

  // Konfirmasi Hapus Buku
  const handleConfirmDelete = () => {
    if (!modal.book) return;
    adminBooks = adminBooks.filter((b) => b.id !== modal.book.id);
    setBooks(adminBooks);
    handleCloseModal();
  };

  return (
    <div className={styles.container}>
      {/* 1. KARTU STATISTIK */}
      <section className={styles.statsCard}>
        <div className={styles.statCol}>
          <span className={styles.statLabel}>TOTAL KOLEKSI</span>
          <span className={styles.statValue}>42.850 Buku</span>
        </div>

        <div className={styles.statDivider} />

        <div className={styles.statCol}>
          <span className={styles.statLabel}>TOTAL JUDUL</span>
          <span className={`${styles.statValue} ${styles.statValueSecondary}`}>
            38.120 Judul
          </span>
        </div>

        <div className={styles.statDivider} />

        <div className={styles.statCol}>
          <span className={styles.statLabel}>SIAP DIPINJAM</span>
          <span className={styles.statValue}>37.320 Eks</span>
        </div>
      </section>

      {/* 2. DAFTAR KOLEKSI BUKU & PENCARIAN */}
      <section className={styles.contentCard}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Daftar Koleksi Buku</h1>
          </div>

          <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
            + Tambah Buku
          </button>
        </div>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari Judul Buku, Topik, atau Kata Kunci..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabel Koleksi Buku */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.bookTable}>
              <thead>
                <tr>
                  <th className={styles.colNo}>No</th>
                  <th className={styles.colCover}>Sampul</th>
                  <th>Judul</th>
                  <th>Penulis</th>
                  <th>Tanggal Terbit</th>
                  <th>Lokasi Rak</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book, index) => (
                    <tr key={book.id}>
                      <td className={styles.colNo}>{index + 1}</td>
                      <td className={styles.colCover}>
                        <img
                          src={book.cover}
                          alt={book.title}
                          className={styles.coverThumb}
                          onClick={() => handleOpenDetail(book)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td>
                        {book.title}
                      </td>
                      <td>{book.author}</td>
                      <td>{book.year}</td>
                      <td>{book.shelf}</td>
                      <td className={styles.actionsCell}>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => handleGoToEdit(book)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleOpenDelete(book)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className={styles.emptyState}>
                        <p className={styles.emptyTitle}>Buku tidak ditemukan</p>
                        <p className={styles.emptyText}>
                          Tidak ada koleksi buku yang sesuai dengan pencarian "{searchTerm}".
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. MODAL TAMBAH BUKU */}
      {modal.type === "add" && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.avatarBadge}>
                  +
                </div>
                <div className={styles.headerInfo}>
                  <h2 className={styles.modalTitle}>Tambah Koleksi Buku</h2>
                  <span className={styles.modalSubtitleId}>ID: #BK-BARU</span>
                </div>
              </div>
              <button type="button" className={styles.closeBtn} onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAdd}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>JUDUL BUKU</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="Contoh: Laskar Pelangi"
                    value={formValues.title}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>PENULIS</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="Nama penulis atau pengarang"
                    value={formValues.author}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, author: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.grid2Col}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>TAHUN TERBIT</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Contoh: 2024"
                      value={formValues.year}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, year: e.target.value }))
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>LOKASI RAK</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Contoh: A-01"
                      value={formValues.shelf}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, shelf: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>KATEGORI KOLEKSI</label>
                  <div className={styles.cardOptionsGrid}>
                    <div
                      className={`${styles.selectCard} ${formValues.category === "fiksi" ? styles.selectCardActive : ""
                        }`}
                      onClick={() =>
                        setFormValues((prev) => ({ ...prev, category: "fiksi" }))
                      }
                    >
                      <span className={styles.cardHead}>Fiksi & Sastra</span>
                      <p className={styles.cardDesc}>
                        Novel, roman, cerpen, dan sastra klasik
                      </p>
                    </div>

                    <div
                      className={`${styles.selectCard} ${formValues.category === "nonfiksi" ? styles.selectCardActive : ""
                        }`}
                      onClick={() =>
                        setFormValues((prev) => ({ ...prev, category: "nonfiksi" }))
                      }
                    >
                      <span className={styles.cardHead}>Sains & Komputer</span>
                      <p className={styles.cardDesc}>
                        Teknologi, sains rekayasa, dan filosofi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCloseModal}
                >
                  Batal
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL KONFIRMASI HAPUS */}
      {modal.type === "delete" && modal.book && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <div
                  className={styles.avatarBadge}
                  style={{ color: "#f43f5e", borderColor: "#3f1a26" }}
                >
                  ✕
                </div>
                <div className={styles.headerInfo}>
                  <h2 className={styles.modalTitle}>Hapus Koleksi Buku</h2>
                </div>
              </div>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                Apakah Anda yakin ingin menghapus buku{" "}
                <strong style={{ color: "#ffffff" }}>"{modal.book.title}"</strong> karya{" "}
                {modal.book.author}? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCloseModal}
              >
                Batal
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={handleConfirmDelete}
              >
                Hapus Buku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL DETAIL BUKU */}
      {modal.type === "detail" && modal.book && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.avatarBadge}>
                  {getInitials(modal.book.title)}
                </div>
                <div className={styles.headerInfo}>
                  <h2 className={styles.modalTitle}>Detail Koleksi Buku</h2>
                  <span className={styles.modalSubtitleId}>
                    ID: #BK-{String(modal.book.id).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <button type="button" className={styles.closeBtn} onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <img
                  src={modal.book.cover}
                  alt={modal.book.title}
                  className={styles.detailCover}
                />
                <div className={styles.detailInfo}>
                  <h3 className={styles.detailTitle}>{modal.book.title}</h3>
                  <div className={styles.detailMeta}>
                    <strong>Penulis:</strong> {modal.book.author}
                  </div>
                  <div className={styles.detailMeta}>
                    <strong>Tahun Terbit:</strong> {modal.book.year}
                  </div>
                  <div className={styles.detailMeta}>
                    <strong>Lokasi Rak:</strong> {modal.book.shelf}
                  </div>
                  <div className={styles.detailMeta}>
                    <strong>Kategori:</strong>{" "}
                    {modal.book.category === "nonfiksi"
                      ? "Sains & Komputer"
                      : "Fiksi & Sastra"}
                  </div>
                  <div className={styles.detailMeta}>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          modal.book.status === "dipinjam" ? "#f59e0b" : "#10b981",
                        fontWeight: "600",
                      }}
                    >
                      {modal.book.status === "dipinjam"
                        ? "Sedang Dipinjam"
                        : "Siap Dipinjam"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  const b = modal.book;
                  handleCloseModal();
                  handleGoToEdit(b);
                }}
                style={{ color: "#38bdf8", borderColor: "#164e63" }}
              >
                Edit Buku Ini
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleCloseModal}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
