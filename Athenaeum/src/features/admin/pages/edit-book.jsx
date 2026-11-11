import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./edit-book.module.css";
import { getAdminBooks, updateAdminBook } from "./book-manager";

function getInitials(text) {
  if (!text) return "BK";
  const words = text.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookData] = useState(() => {
    const books = getAdminBooks();
    return books.find((b) => String(b.id) === String(id)) || location.state?.book || null;
  });

  const [formValues, setFormValues] = useState(() => ({
    title: bookData?.title || "",
    author: bookData?.author || "",
    year: bookData?.year || "",
    shelf: bookData?.shelf || "",
    category: bookData?.category || "fiksi",
    status: bookData?.status || "tersedia",
  }));
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!bookData) {
      navigate("/admin/books", { replace: true });
    }
  }, [bookData, navigate]);

  const handleBack = () => {
    navigate("/admin/books");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateAdminBook({
      id,
      title: formValues.title.trim(),
      author: formValues.author.trim() || bookData.author,
      year: formValues.year.trim() || bookData.year,
      shelf: formValues.shelf.trim() || bookData.shelf,
      category: formValues.category,
      status: formValues.status,
    });

    navigate("/admin/books");
  };

  if (!bookData) return null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.editCard}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarBadge}>
              {getInitials(formValues.title || bookData.title)}
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.cardTitle}>Edit Buku</h1>
              <span className={styles.subtitleId}>
                ID: #BK-{String(bookData.id).padStart(2, "0")}
              </span>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={handleBack}>
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formBody}>
            {/* Judul Buku */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>JUDUL BUKU</label>
              <input
                type="text"
                className={`${styles.formInput} ${
                  formErrors.title ? styles.inputError : ""
                }`}
                placeholder="Masukkan judul buku"
                value={formValues.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
              {formErrors.title && (
                <span className={styles.formErrorText}>{formErrors.title}</span>
              )}
            </div>

            {/* Penulis */}
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
                <span className={styles.formErrorText}>{formErrors.author}</span>
              )}
            </div>

            {/* 2 Kolom: Tahun Terbit & Lokasi Rak */}
            <div className={styles.grid2Col}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>TAHUN TERBIT</label>
                <input
                  type="text"
                  className={`${styles.formInput} ${
                    formErrors.year ? styles.inputError : ""
                  }`}
                  placeholder="Contoh: 2005"
                  value={formValues.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                />
                {formErrors.year && (
                  <span className={styles.formErrorText}>{formErrors.year}</span>
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
                  <span className={styles.formErrorText}>{formErrors.shelf}</span>
                )}
              </div>
            </div>

            {/* Kategori Koleksi */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>KATEGORI KOLEKSI</label>
              <div className={styles.cardOptionsGrid}>
                <div
                  className={`${styles.selectCard} ${
                    formValues.category === "fiksi" ? styles.selectCardActive : ""
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
                  className={`${styles.selectCard} ${
                    formValues.category === "nonfiksi" ? styles.selectCardActive : ""
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

            {/* Status Ketersediaan */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>STATUS KETERSEDIAAN</label>
              <div className={styles.cardOptionsGrid}>
                <div
                  className={`${styles.selectCard} ${
                    formValues.status === "tersedia" ? styles.selectCardActive : ""
                  }`}
                  onClick={() =>
                    setFormValues((prev) => ({ ...prev, status: "tersedia" }))
                  }
                >
                  <span className={styles.cardHead}>Siap Dipinjam</span>
                  <p className={styles.cardDesc}>
                    Tersedia di rak untuk dipinjam anggota
                  </p>
                </div>

                <div
                  className={`${styles.selectCard} ${
                    formValues.status === "dipinjam" ? styles.selectCardActive : ""
                  }`}
                  onClick={() =>
                    setFormValues((prev) => ({ ...prev, status: "dipinjam" }))
                  }
                >
                  <span className={styles.cardHead}>Sedang Dipinjam</span>
                  <p className={styles.cardDesc}>
                    Buku sedang dibawa oleh anggota perpustakaan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Card */}
          <div className={styles.cardFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleBack}
            >
              Batal
            </button>
            <button type="submit" className={styles.saveBtn}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
