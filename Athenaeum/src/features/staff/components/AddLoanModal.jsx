import { useEffect, useId, useMemo, useState } from "react";
import styles from "./AddLoanModal.module.css";
import BookThumb from "./BookThumb";
import { addDays, fmtRupiah, fmtShort, fromInputDate, shelfOf, toInputDate } from "../loanUtils";

/*
 * Popup "Tambah Peminjaman".
 *
 * Props:
 *  books     : daftar buku (dari books.json) yang bisa dipinjam
 *  members   : daftar anggota (dari loans.json)
 *  loans     : pinjaman aktif saat ini (untuk menghitung stok & pinjaman anggota)
 *  stock     : { [bookId]: jumlah eksemplar }
 *  rules     : { finePerDay, durations, defaultDuration }
 *  today     : Date
 *  onClose   : () => void
 *  onSave    : ({ bookId, memberId, borrowDate, durationDays }) => void
 */

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const OpenBookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
  </svg>
);

/* Input pencarian dengan daftar saran (combobox sederhana) */
function SearchSelect({ id, value, onChange, options, getLabel, renderOption, placeholder, emptyText }) {
  const listId = useId();
  const [text, setText] = useState(value ? getLabel(value) : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const q = text.trim().toLowerCase();
  const matches = (value && text === getLabel(value) ? options : options.filter((o) => getLabel(o).toLowerCase().includes(q))).slice(0, 6);

  const pick = (o) => {
    onChange(o);
    setText(getLabel(o));
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && matches[active]) {
      e.preventDefault();
      pick(matches[active]);
    } else if (e.key === "Escape" && open) {
      e.stopPropagation(); // tutup daftar saja, bukan modal
      setOpen(false);
    }
  };

  return (
    <div className={styles.combo}>
      <span className={styles.inputIcon}>
        <SearchIcon />
      </span>
      <input
        id={id}
        type="text"
        className={styles.input}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(0);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul id={listId} className={styles.options} role="listbox">
          {matches.length === 0 && <li className={styles.optionEmpty}>{emptyText}</li>}
          {matches.map((o, i) => (
            <li
              key={getLabel(o)}
              role="option"
              aria-selected={i === active}
              className={`${styles.option} ${i === active ? styles.optionActive : ""}`}
              onMouseDown={(e) => {
                e.preventDefault(); // cegah input blur sebelum klik terpilih
                pick(o);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {renderOption(o)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddLoanModal({ books, members, loans, stock, rules, today, onClose, onSave }) {
  const [member, setMember] = useState(null);
  const [book, setBook] = useState(null);
  const [dateStr, setDateStr] = useState(() => toInputDate(today));
  const [duration, setDuration] = useState(rules.defaultDuration);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const available = useMemo(() => {
    const out = {};
    for (const b of books) out[b.id] = (stock[b.id] ?? 0) - loans.filter((l) => l.book.id === b.id).length;
    return out;
  }, [books, loans, stock]);

  const memberLoans = member ? loans.filter((l) => l.member.id === member.id).length : 0;
  const borrowDate = fromInputDate(dateStr);
  const dueDate = borrowDate ? addDays(borrowDate, duration) : null;
  const bookAvail = book ? available[book.id] : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!member) return setError("Pilih peminjam dari daftar anggota.");
    if (!member.verified) return setError(`${member.name} belum terverifikasi, tidak dapat meminjam buku.`);
    if (!book) return setError("Pilih buku dari koleksi.");
    if (bookAvail <= 0) return setError(`Stok "${book.title}" sedang habis.`);
    if (!borrowDate) return setError("Tanggal pinjam tidak valid.");
    if (borrowDate > today) return setError("Tanggal pinjam tidak boleh melebihi hari ini.");
    if (loans.some((l) => l.member.id === member.id && l.book.id === book.id))
      return setError(`${member.name} masih meminjam "${book.title}".`);

    onSave({ bookId: book.id, memberId: member.id, borrowDate, durationDays: duration });
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <form
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loan-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <header className={styles.head}>
          <span className={styles.headIcon}>
            <OpenBookIcon />
          </span>
          <div className={styles.headText}>
            <h3 id="loan-title" className={styles.title}>
              Tambah Peminjaman
            </h3>
            <p className={styles.sub}>Catat sirkulasi buku yang dipinjam anggota perpustakaan.</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </header>

        <div className={styles.body}>
          {/* PEMINJAM */}
          <div className={styles.field}>
            <label htmlFor="loan-member" className={styles.label}>
              PEMINJAM
            </label>
            <SearchSelect
              id="loan-member"
              value={member}
              onChange={(m) => {
                setMember(m);
                setError("");
              }}
              options={members}
              getLabel={(m) => `${m.name} · ${m.id}`}
              renderOption={(m) => (
                <>
                  <span>
                    <strong>{m.name}</strong>
                    <small>{m.id}</small>
                  </span>
                  {!m.verified && <em className={styles.warnTag}>Belum verifikasi</em>}
                </>
              )}
              placeholder="Cari nama atau ID anggota..."
              emptyText="Anggota tidak ditemukan"
            />
            {member && (
              <p className={styles.hint} data-tone={member.verified ? "ok" : "warn"}>
                <i className={styles.dot} />
                {memberLoans} pinjaman aktif · {member.verified ? "Anggota terverifikasi" : "Anggota belum terverifikasi"}
              </p>
            )}
          </div>

          {/* BUKU */}
          <div className={styles.field}>
            <label htmlFor="loan-book" className={styles.label}>
              BUKU KOLEKSI
            </label>
            <SearchSelect
              id="loan-book"
              value={book}
              onChange={(b) => {
                setBook(b);
                setError("");
              }}
              options={books}
              getLabel={(b) => `${b.title} — ${b.author}`}
              renderOption={(b) => (
                <>
                  <BookThumb book={b} width={26} height={34} />
                  <span>
                    <strong>{b.title}</strong>
                    <small>
                      {b.author} · {shelfOf(b)}
                    </small>
                  </span>
                  <em className={available[b.id] > 0 ? styles.okTag : styles.warnTag}>
                    {available[b.id] > 0 ? `${available[b.id]} tersedia` : "Habis"}
                  </em>
                </>
              )}
              placeholder="Cari judul atau pengarang..."
              emptyText="Buku tidak ditemukan"
            />
          </div>

          {book && (
            <div className={styles.bookCard}>
              <BookThumb book={book} width={38} height={50} />
              <div className={styles.bookInfo}>
                <strong>{book.title}</strong>
                <span>
                  {book.author} · {shelfOf(book)}
                </span>
              </div>
              <span className={styles.stockPill} data-tone={bookAvail > 0 ? "ok" : "warn"}>
                {bookAvail > 0 ? `${bookAvail} eksemplar tersedia` : "Stok habis"}
              </span>
            </div>
          )}

          {/* TANGGAL */}
          <div className={styles.field}>
            <label htmlFor="loan-date" className={styles.label}>
              TANGGAL PINJAM
            </label>
            <input
              id="loan-date"
              type="date"
              className={`${styles.input} ${styles.dateInput}`}
              value={dateStr}
              max={toInputDate(today)}
              onChange={(e) => {
                setDateStr(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* DURASI */}
          <fieldset className={styles.field}>
            <legend className={styles.label}>LAMA PEMINJAMAN</legend>
            <div className={styles.durations}>
              {rules.durations.map((d) => (
                <label key={d.days} className={`${styles.duration} ${duration === d.days ? styles.durationActive : ""}`}>
                  <input
                    type="radio"
                    name="loan-duration"
                    value={d.days}
                    checked={duration === d.days}
                    onChange={() => setDuration(d.days)}
                  />
                  <strong>{d.days} hari</strong>
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* JATUH TEMPO */}
          <div className={styles.dueBox}>
            <div className={styles.dueRow}>
              <span>Perkiraan Jatuh Tempo</span>
              <strong>{dueDate ? fmtShort.format(dueDate) : "-"}</strong>
            </div>
            <p className={styles.dueNote}>
              Denda keterlambatan {fmtRupiah(rules.finePerDay)} / hari jika melewati batas tempo
            </p>
          </div>

          <p className={styles.error} role="alert" hidden={!error}>
            {error}
          </p>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.ghost} onClick={onClose}>
            Batal
          </button>
          <button type="submit" className={styles.primary}>
            Simpan Peminjaman
          </button>
        </footer>
      </form>
    </div>
  );
}
