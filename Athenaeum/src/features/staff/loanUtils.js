/*
 * Helper bersama untuk data peminjaman buku (halaman Pinjaman Buku & Dashboard staff).
 *
 * Sumber data:
 *  - public/data/books.json : data buku (judul, penulis, lokasi rak, cover gambar)
 *  - public/data/loans.json : transaksi pinjaman (bookId, memberId, borrowOffset, durationDays)
 *
 * borrowOffset = selisih hari tanggal pinjam terhadap hari ini (negatif = di masa lalu),
 * sehingga data contoh selalu terlihat "aktual" kapan pun aplikasi dibuka.
 */
import { COVERS } from "../../assets/images";

const DAY_MS = 24 * 60 * 60 * 1000;

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const diffDays = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / DAY_MS);

export const fmtShort = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
export const fmtRupiah = (n) => `Rp${new Intl.NumberFormat("id-ID").format(n)}`;

/** Date -> "YYYY-MM-DD" (zona waktu lokal) untuk <input type="date"> */
export const toInputDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** "YYYY-MM-DD" -> Date lokal (null jika tidak valid) */
export const fromInputDate = (s) => {
  const [y, m, d] = String(s).split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};

export const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** "Rak B-09, Lantai 2 (Sastra Indonesia)" -> "Rak B-09" */
export const shelfOf = (book) => (book?.location ?? "").split(",")[0] || "-";

/** Hanya buku yang memiliki file cover gambar */
export const hasImageCover = (book) => book.coverType === "image" && Boolean(COVERS[book.cover]);
export const coverSrc = (book) => (book && hasImageCover(book) ? COVERS[book.cover] : null);

/**
 * Ubah data mentah loans.json menjadi objek siap pakai:
 * { id, book, member, borrowDate, dueDate, durationDays }
 * Pinjaman yang bukunya tidak ditemukan di books.json dilewati.
 */
export function hydrateLoans(rawLoans, books, members, today) {
  const bookById = new Map(books.map((b) => [b.id, b]));
  const memberById = new Map(members.map((m) => [m.id, m]));
  return rawLoans
    .map((l) => {
      const book = bookById.get(l.bookId);
      if (!book) return null;
      const borrowDate = addDays(today, l.borrowOffset);
      return {
        id: l.id,
        book,
        member: memberById.get(l.memberId) ?? { id: l.memberId, name: l.memberId },
        borrowDate,
        durationDays: l.durationDays,
        dueDate: addDays(borrowDate, l.durationDays),
      };
    })
    .filter(Boolean);
}

/**
 * Status pinjaman berdasarkan sisa hari menuju jatuh tempo.
 * kind: "terlambat" | "dekat" (0..dueSoonDays hari lagi) | "normal"
 */
export function loanStatus(loan, today, rules) {
  const left = diffDays(loan.dueDate, today);
  if (left < 0) {
    const late = -left;
    return { kind: "terlambat", tone: "red", label: `Terlambat ${late} hari`, lateDays: late, fine: late * rules.finePerDay };
  }
  if (left === 0) return { kind: "dekat", tone: "amber", label: "Tenggat Hari Ini", lateDays: 0, fine: 0 };
  if (left <= rules.dueSoonDays) return { kind: "dekat", tone: "amber", label: `${left} hari lagi`, lateDays: 0, fine: 0 };
  return { kind: "normal", tone: "cyan", label: "Dipinjam", lateDays: 0, fine: 0 };
}
