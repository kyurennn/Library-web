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

  useEffect(() => {
    if (!bookData) {
      navigate("/admin/books", { replace: true });
    }
  }, [bookData, navigate]);

  const handleBack = () => {
    navigate("/admin/books");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formValues.title.trim()) return;

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
        <form onSubmit={handleSubmit}>
          <div className={styles.formBody}>
            {/* Judul Buku */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>JUDUL BUKU</label>
              <input
                type="text"
                required
                className={styles.formInput}
                placeholder="Masukkan judul buku"
                value={formValues.title}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Penulis */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>PENULIS</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Nama penulis atau pengarang"
                value={formValues.author}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, author: e.target.value }))
                }
              />
            </div>

            {/* 2 Kolom: Tahun Terbit & Lokasi Rak */}
            <div className={styles.grid2Col}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>TAHUN TERBIT</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Contoh: 2005"
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
