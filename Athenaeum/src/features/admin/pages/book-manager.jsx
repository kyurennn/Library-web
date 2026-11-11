import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./book-manager.module.css";
import { useFetch } from "../../../hooks/useFetch";
import { getBooks } from "../../../api/library";
import { COVERS } from "../../../assets/images";

// Format data dari API agar memiliki struktur seragam
export function formatBookItem(b) {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    year: b.year || "2024",
    shelf: b.location ? b.location.split(",")[0].trim() : "Rak A-01",
    category: b.category || "Fiksi & Sastra",
    status: b.status || "tersedia",
    cover: b.cover && COVERS[b.cover] ? COVERS[b.cover] : null,
  };
}

// Cache buku di memori untuk keperluan navigasi & edit
let adminBooksCache = null;

export function getAdminBooks() {
  return adminBooksCache || [];
}

export function updateAdminBook(updatedBook) {
  if (adminBooksCache) {
    adminBooksCache = adminBooksCache.map((b) =>
      String(b.id) === String(updatedBook.id) ? { ...b, ...updatedBook } : b
    );
  }
  return adminBooksCache;
}

function getInitials(text) {
  if (!text) return "BK";
  const words = text.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function BookManager() {
  const navigate = useNavigate();
  const { data, loading: fetchLoading, error, reload } = useFetch(getBooks);
  const [books, setBooks] = useState(() => adminBooksCache || []);
  const [searchTerm, setSearchTerm] = useState("");

  const loading = !adminBooksCache && fetchLoading;

  // Sinkronkan data hasil fetch API ke state & cache lokal
  useEffect(() => {
    if (data && !adminBooksCache) {
      const formatted = (Array.isArray(data) ? data : []).map(formatBookItem);
      adminBooksCache = formatted;
      setBooks(formatted);
    }
  }, [data]);

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
  const [formErrors, setFormErrors] = useState({});

  // Validasi form client-side
  const validateForm = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!formValues.title.trim()) {
      errors.title = "Judul buku wajib diisi.";
    } else if (formValues.title.trim().length < 2) {
      errors.title = "Judul buku minimal 2 karakter.";
    }

    if (!formValues.author.trim()) {
      errors.author = "Nama penulis wajib diisi.";
    }

    if (!formValues.year.trim()) {
      errors.year = "Tahun terbit wajib diisi.";
    } else if (!/^\d{4}$/.test(formValues.year.trim())) {
      errors.year = "Tahun harus berupa 4 digit angka.";
    } else {
      const yearNum = parseInt(formValues.year.trim(), 10);
      if (yearNum < 1500 || yearNum > currentYear + 1) {
        errors.year = `Tahun harus antara 1500 dan ${currentYear + 1}.`;
      }
    }

    if (!formValues.shelf.trim()) {
      errors.shelf = "Lokasi rak wajib diisi.";
    }

    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
      shelf: "Rak A-01",
      category: "fiksi",
      status: "tersedia",
    });
    setFormErrors({});
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
    setFormErrors({});
    setModal({ type: null, book: null });
  };

  // Simpan Tambah Buku Baru
  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newBook = {
      id: Date.now(),
      title: formValues.title.trim(),
      author: formValues.author.trim(),
      year: formValues.year.trim(),
      shelf: formValues.shelf.trim(),
      category:
        formValues.category === "nonfiksi"
          ? "Sains & Komputer"
          : "Fiksi & Sastra",
      status: formValues.status || "tersedia",
      cover: null,
    };

    adminBooksCache = [newBook, ...books];
    setBooks(adminBooksCache);
    handleCloseModal();
  };

  // Konfirmasi Hapus Buku
  const handleConfirmDelete = () => {
    if (!modal.book) return;
    adminBooksCache = books.filter((b) => b.id !== modal.book.id);
    setBooks(adminBooksCache);
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
                {loading ? (
                  <tr>
                    <td colSpan="7">
                      <div className={styles.loadingBox}>
                        <span className={styles.spinner} />
                        Memuat data koleksi buku...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7">
                      <div className={styles.errorBox}>
                        <p>{error.message || "Gagal memuat data buku."}</p>
                        <button
                          type="button"
                          className={styles.retryBtn}
                          onClick={reload}
                        >
                          Coba Lagi
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredBooks.length > 0 ? (
                  filteredBooks.map((book, index) => (
                    <tr key={book.id}>
                      <td className={styles.colNo}>{index + 1}</td>
                      <td className={styles.colCover}>
                        {book.cover ? (
                          <img
                            src={book.cover}
                            alt={book.title}
                            className={styles.coverThumb}
                            onClick={() => handleOpenDetail(book)}
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          <div
                            className={styles.coverPlaceholder}
                            onClick={() => handleOpenDetail(book)}
                            style={{ cursor: "pointer" }}
                            title={book.title}
                          >
                            {getInitials(book.title)}
                          </div>
                        )}
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

            <form onSubmit={handleSubmitAdd} noValidate>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>JUDUL BUKU</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${
                      formErrors.title ? styles.inputError : ""
                    }`}
                    placeholder="Contoh: Laskar Pelangi"
                    value={formValues.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                  {formErrors.title && (
                    <span className={styles.formErrorText}>
                      {formErrors.title}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>PENULIS</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${
                      formErrors.author ? styles.inputError : ""
                    }`}
                    placeholder="Nama penulis atau pengarang"
                    value={formValues.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                  />
                  {formErrors.author && (
                    <span className={styles.formErrorText}>
                      {formErrors.author}
                    </span>
                  )}
                </div>

                <div className={styles.grid2Col}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>TAHUN TERBIT</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${
                        formErrors.year ? styles.inputError : ""
                      }`}
                      placeholder="Contoh: 2024"
                      value={formValues.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                    />
                    {formErrors.year && (
                      <span className={styles.formErrorText}>
                        {formErrors.year}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>LOKASI RAK</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${
                        formErrors.shelf ? styles.inputError : ""
                      }`}
                      placeholder="Contoh: Rak A-01"
                      value={formValues.shelf}
                      onChange={(e) => handleInputChange("shelf", e.target.value)}
                    />
                    {formErrors.shelf && (
                      <span className={styles.formErrorText}>
                        {formErrors.shelf}
                      </span>
                    )}
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
                {modal.book.cover ? (
                  <img
                    src={modal.book.cover}
                    alt={modal.book.title}
                    className={styles.detailCover}
                  />
                ) : (
                  <div className={styles.detailCoverPlaceholder}>
                    {getInitials(modal.book.title)}
                  </div>
                )}
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