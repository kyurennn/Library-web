// src/features/admin/staff/staffUtils.js
import AT from "../../../assets/profile/AT.png";

/**
 * Peta gambar profil statis bawaan proyek
 */
export const AVATAR_MAP = {
  AT,
};

/**
 * Ambil inisial nama staf (maksimal 2 huruf)
 */
export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

/**
 * Warna latar inisial yang konsisten berdasarkan nama
 */
const INITIAL_COLORS = [
  "linear-gradient(135deg, #0e7490, #155e75)", // teal
  "linear-gradient(135deg, #1e40af, #1e3a8a)", // blue
  "linear-gradient(135deg, #334155, #1e293b)", // slate
  "linear-gradient(135deg, #0369a1, #075985)", // sky
  "linear-gradient(135deg, #4338ca, #3730a3)", // indigo
];

export function getAvatarBackground(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % INITIAL_COLORS.length;
  return INITIAL_COLORS[idx];
}

/**
 * Validasi email sederhana
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

/**
 * Waktu shift kerja standar perpustakaan
 */
export const SHIFT_TIMES = {
  "Shift Pagi": "08:00 - 13:00",
  "Shift Siang": "12:00 - 17:00",
};

/**
 * Format ID dengan awalan # jika belum ada
 */
export function formatStaffId(id) {
  if (!id) return "";
  const clean = String(id).trim();
  return clean.startsWith("#") ? clean : `#${clean}`;
}

/**
 * Bersihkan ID untuk perbandingan
 */
export function normalizeId(id) {
  return String(id || "").replace(/^#/, "").trim().toLowerCase();
}

/**
 * Ekspor data staf ke berkas CSV
 */
export function exportStaffToCsv(staffList, filename = "staff-management.csv") {
  const headers = [
    "No",
    "ID Staff",
    "Nama Lengkap",
    "Email Resmi",
    "Peran",
    "Shift Kerja",
    "Jam Kerja",
    "Status Akun",
  ];

  const escapeCell = (val) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = staffList.map((s, idx) => [
    idx + 1,
    formatStaffId(s.id),
    s.name,
    s.email,
    s.role,
    s.shift,
    s.shiftTime || SHIFT_TIMES[s.shift] || "-",
    s.status,
  ]);

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\r\n");

  // Tambahkan BOM \uFEFF agar UTF-8 terbaca dengan sempurna di MS Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
