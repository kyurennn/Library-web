//sebagai HTTP client tunggal untuk seluruh web pk Fetch API bawaan browser
const API_BASE = `${import.meta.env.BASE_URL}data`;

export async function fetchJson(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}/${path}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
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
