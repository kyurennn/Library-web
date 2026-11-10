/**
 * HTTP client tunggal untuk seluruh aplikasi (menggunakan Fetch API bawaan browser).
 *
 * Semua halaman mengambil data lewat fungsi ini, tidak memanggil fetch() sendiri,
 * sehingga penanganan error dan alamat dasar (base URL) cukup diatur di satu tempat.
 *
 * Mock API: file JSON di folder `public/data/` dilayani Vite sebagai URL biasa
 * (mis. /data/books.json). Saat backend/API asli sudah ada, cukup ubah API_BASE
 * (misalnya menjadi "https://api.contoh.com") dan sesuaikan path di library.js.
 */
const API_BASE = `${import.meta.env.BASE_URL}data`;

export async function fetchJson(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}/${path}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    // Request dibatalkan (komponen ditutup) -> teruskan apa adanya
    if (err.name === "AbortError") throw err;
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
  }

  if (!response.ok) {
    throw new Error(`Gagal memuat data (${response.status} ${response.statusText || ""}).`.trim());
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Format data dari server tidak valid.");
  }
}
