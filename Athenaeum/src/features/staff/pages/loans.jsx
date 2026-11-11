import { useMemo, useState } from "react";
import styles from "./loans.module.css";
import { useFetch } from "../../../hooks/useFetch";
import DataState from "../../../components/DataState";
import { getBooks, getLoans } from "../../../api/library";
import BookThumb from "../components/BookThumb";
import AddLoanModal from "../components/AddLoanModal";
import {
  diffDays,
  fmtRupiah,
  fmtShort,
  hasImageCover,
  hydrateLoans,
  initials,
  loanStatus,
  shelfOf,
  startOfDay,
  toInputDate,
} from "../loanUtils";

/*
 * Halaman Pinjaman Buku (staff).
 * Data buku  : public/data/books.json
 * Data pinjam: public/data/loans.json
 */

const nf = new Intl.NumberFormat("id-ID");

const FILTERS = [
  ["semua", "Semua Sirkulasi"],
  ["normal", "Dipinjam Normal"],
  ["dekat", "Jatuh Tempo Dekat"],
  ["terlambat", "Terlambat"],
];

/* ---------- ICONS ---------- */
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const ReturnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- ISI HALAMAN ---------- */
function LoansContent({ books, loanData }) {
  const { rules, stock, members } = loanData;
  const [today] = useState(() => startOfDay(new Date()));

  // Hanya buku yang memiliki gambar cover di books.json
  const loanableBooks = useMemo(() => books.filter(hasImageCover), [books]);

  const [items, setItems] = useState(() => hydrateLoans(loanData.loans, books, members, today));
  const [summary, setSummary] = useState(loanData.summary);
  const [filter, setFilter] = useState("semua");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "ok" | "error", text }

  // Lengkapi setiap pinjaman dengan status, lalu urutkan dari jatuh tempo terdekat
  const rows = useMemo(
    () =>
      items
        .map((l) => ({ ...l, status: loanStatus(l, today, rules) }))
        .sort((a, b) => a.dueDate - b.dueDate || a.id - b.id),
    [items, today, rules]
  );

  const counts = useMemo(
    () => ({
      semua: rows.length,
      normal: rows.filter((r) => r.status.kind === "normal").length,
      dekat: rows.filter((r) => r.status.kind === "dekat").length,
      terlambat: rows.filter((r) => r.status.kind === "terlambat").length,
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "semua" || r.status.kind === filter) &&
        (!q ||
          r.book.title.toLowerCase().includes(q) ||
          r.book.author.toLowerCase().includes(q) ||
          r.member.name.toLowerCase().includes(q) ||
          r.member.id.toLowerCase().includes(q))
    );
  }, [rows, filter, query]);

  /* ---------- AKSI ---------- */
  const handleReturn = (row) => {
    setItems((list) => list.filter((l) => l.id !== row.id));
    setSummary((s) => ({
      activeLoans: s.activeLoans - 1,
      overdue: row.status.kind === "terlambat" ? s.overdue - 1 : s.overdue,
      runningFines: Math.max(0, s.runningFines - row.status.fine),
    }));
    setNotice({
      type: "ok",
      text:
        row.status.fine > 0
          ? `"${row.book.title}" dikembalikan oleh ${row.member.name}. Denda ${fmtRupiah(row.status.fine)} dilunasi.`
          : `"${row.book.title}" dikembalikan oleh ${row.member.name} tepat waktu.`,
    });
  };

  const handleAdd = ({ bookId, memberId, borrowDate, durationDays }) => {
    const nextId = Math.max(0, ...items.map((l) => l.id)) + 1;
    const [loan] = hydrateLoans(
      [{ id: nextId, bookId, memberId, borrowOffset: diffDays(borrowDate, today), durationDays }],
      books,
      members,
      today
    );
    setItems((list) => [...list, loan]);
    const st = loanStatus(loan, today, rules);
    setSummary((s) => ({
      activeLoans: s.activeLoans + 1,
      overdue: st.kind === "terlambat" ? s.overdue + 1 : s.overdue,
      runningFines: s.runningFines + st.fine,
    }));
    setShowAdd(false);
    setFilter("semua");
    setNotice({
      type: "ok",
      text: `Peminjaman "${loan.book.title}" oleh ${loan.member.name} tersimpan. Jatuh tempo ${fmtShort.format(loan.dueDate)}.`,
    });
  };

  const handleExport = () => {
    downloadCsv(`pinjaman-buku-${toInputDate(today)}.csv`, [
      ["No", "Judul", "Pengarang", "Rak", "Peminjam", "ID Anggota", "Tanggal Pinjam", "Jatuh Tempo", "Status", "Denda"],
      ...visible.map((r, i) => [
        i + 1,
        r.book.title,
        r.book.author,
        shelfOf(r.book),
        r.member.name,
        r.member.id,
        fmtShort.format(r.borrowDate),
        fmtShort.format(r.dueDate),
        r.status.label,
        r.status.fine,
      ]),
    ]);
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Pinjaman Buku Perpustakaan</h1>
        <p className={styles.subtitle}>
          Pantau sirkulasi peminjaman, jatuh tempo, pengembalian, dan denda keterlambatan buku secara real-time.
        </p>
        <div className={styles.headActions}>
          <button type="button" className={styles.ghostBtn} onClick={handleExport}>
            <DownloadIcon /> Ekspor CSV
          </button>
          <button type="button" className={styles.primaryBtn} onClick={() => setShowAdd(true)}>
            <PlusIcon /> Tambah Peminjaman
          </button>
        </div>
      </header>

      <p
        className={`${styles.notice} ${notice?.type === "error" ? styles.noticeError : ""}`}
        role="status"
        aria-live="polite"
        hidden={!notice}
      >
        {notice?.text}
      </p>

      {/* STATISTIK */}
      <section className={styles.stats} aria-label="Ringkasan pinjaman">
        <div className={styles.statCard} data-tone="cyan">
          <div className={styles.statTop}>
            <span>PINJAMAN AKTIF</span>
            <em>Sirkulasi</em>
          </div>
          <p className={styles.statValue}>
            {nf.format(summary.activeLoans)} <small>Eksemplar</small>
          </p>
          <p className={styles.statNote}>Dipinjam oleh anggota terdaftar</p>
        </div>
        <div className={styles.statCard} data-tone="red">
          <div className={styles.statTop}>
            <span>TERLAMBAT KEMBALI</span>
            <em>Perlu Tindakan</em>
          </div>
          <p className={styles.statValue}>
            {nf.format(summary.overdue)} <small>Eksemplar</small>
          </p>
          <p className={styles.statNote}>Melewati tenggat {rules.defaultDuration} hari peminjaman</p>
        </div>
        <div className={styles.statCard} data-tone="blue">
          <div className={styles.statTop}>
            <span>DENDA BERJALAN</span>
            <em>Tarif {fmtRupiah(rules.finePerDay)}/hari</em>
          </div>
          <p className={styles.statValue}>{fmtRupiah(summary.runningFines)}</p>
          <p className={styles.statNote}>Akumulasi denda otomatis sistem</p>
        </div>
      </section>

      {/* TABEL */}
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Daftar Sirkulasi Pinjaman Aktif</h2>
        <p className={styles.panelSub}>
          Denda keterlambatan {fmtRupiah(rules.finePerDay)} per hari per buku dihitung otomatis. Fasilitas perpanjangan 7
          hari.
        </p>

        <div className={styles.chips} role="tablist" aria-label="Filter status pinjaman">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`${styles.chip} ${filter === key ? styles.chipActive : ""}`}
              onClick={() => setFilter(key)}
            >
              {label} <span>{counts[key]}</span>
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <SearchIcon />
          <input
            type="search"
            className={styles.search}
            placeholder="Cari judul buku, pengarang, atau peminjam..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari judul buku, pengarang, atau peminjam"
          />
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NO</th>
                <th>BUKU &amp; KOLEKSI</th>
                <th>PEMINJAM</th>
                <th>TANGGAL PINJAM</th>
                <th>JATUH TEMPO</th>
                <th>STATUS</th>
                <th>DENDA</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    Tidak ada pinjaman yang cocok dengan filter.
                  </td>
                </tr>
              )}
              {visible.map((r, i) => (
                <tr key={r.id}>
                  <td className={styles.no}>{i + 1}</td>
                  <td>
                    <div className={styles.book}>
                      <BookThumb book={r.book} width={36} height={48} />
                      <div>
                        <strong>{r.book.title}</strong>
                        <span>
                          {r.book.author} · {shelfOf(r.book)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.person}>
                      <span className={styles.avatar}>{initials(r.member.name)}</span>
                      <div>
                        <strong>{r.member.name}</strong>
                        <span>{r.member.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.date}>{fmtShort.format(r.borrowDate)}</td>
                  <td className={styles.date}>{fmtShort.format(r.dueDate)}</td>
                  <td>
                    <span className={styles.pill} data-tone={r.status.tone}>
                      <i /> {r.status.label}
                    </span>
                  </td>
                  <td>
                    {r.status.fine > 0 ? (
                      <span className={styles.fine}>{fmtRupiah(r.status.fine)}</span>
                    ) : (
                      <span className={styles.noFine}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.returnBtn}
                      onClick={() => handleReturn(r)}
                      aria-label={`Tandai "${r.book.title}" oleh ${r.member.name} sudah dikembalikan`}
                    >
                      <ReturnIcon /> Dikembalikan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.tableFoot}>
            <span>
              Menampilkan {visible.length} dari {rows.length} sirkulasi pinjaman
            </span>
            <span>Diperbarui otomatis · {fmtShort.format(today)}</span>
          </div>
        </div>
      </section>

      {showAdd && (
        <AddLoanModal
          books={loanableBooks}
          members={members}
          loans={items}
          stock={stock}
          rules={rules}
          today={today}
          onClose={() => setShowAdd(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
}

/* ---------- PAGE: ambil data lewat fetch() dari books.json & loans.json ---------- */
export default function Loans() {
  const books = useFetch(getBooks);
  const loans = useFetch(getLoans);
  const loading = books.loading || loans.loading;
  const error = books.error || loans.error;

  if (loading || error) {
    return (
      <DataState
        loading={loading}
        error={error}
        label="Memuat data pinjaman..."
        onRetry={() => {
          books.reload();
          loans.reload();
        }}
      />
    );
  }
  return <LoansContent books={books.data} loanData={loans.data} />;
}
