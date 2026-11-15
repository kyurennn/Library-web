# Athenaeum Digital — Website Perpustakaan

Aplikasi web perpustakaan dengan tiga peran (Pengguna, Staf, Admin). Dibangun dengan **React 19 + Vite + React Router 7** dan **CSS Modules**. Data diambil dari file JSON di `public/data/` melalui `fetch` (Mock API), sehingga **tidak perlu database maupun backend** untuk menjalankannya.

## Persyaratan

| Perangkat lunak | Versi | Keterangan |
| --- | --- | --- |
| [Node.js](https://nodejs.org) | **20.19+** atau **22.12+** (disarankan versi LTS terbaru) | Sudah termasuk `npm` |
| Git | opsional | Hanya jika mengunduh lewat `git clone` |

Cek versi yang terpasang:

```bash
node -v
npm -v
```

## Cara Menjalankan di Komputer Lokal

1. **Unduh proyek**

   ```bash
   git clone https://github.com/kyurennn/library-web.git
   cd library-web/Athenaeum
   ```

   Jika tanpa Git: unduh ZIP dari GitHub (tombol *Code → Download ZIP*), ekstrak, lalu buka folder `Athenaeum` di terminal.

2. **Pasang dependensi** (cukup sekali, butuh internet)

   ```bash
   npm install
   ```

3. **Jalankan mode pengembangan**

   ```bash
   npm run dev
   ```

4. **Buka di browser** alamat yang tampil di terminal, biasanya <http://localhost:5173>.

   Untuk menghentikan server, tekan `Ctrl + C` di terminal.

## Akun Demo

Halaman login memiliki tiga peran. Gunakan akun berikut:

| Peran | Username | Password | Halaman awal |
| --- | --- | --- | --- |
| Pengguna | `Kane Fukukitaru` | `user123` | `/` (beranda, katalog, layanan, profil) |
| Staf | `wisadel` | `staff123` | `/staff` (dashboard, reservasi ruang, pinjaman buku) |
| Admin | `Agnes Tachyon` | `admin123` | `/admin` (kelola buku, dashboard, reservasi) |

> Akun ini hanya data contoh (mock) untuk keperluan demo/prototipe.

## Perintah Lain

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan (hot reload) |
| `npm run build` | Membuat versi produksi di folder `dist/` |
| `npm run preview` | Menjalankan hasil build di <http://localhost:4173> (jalankan `npm run build` dulu) |
| `npm run lint` | Memeriksa kode dengan Oxlint |

## Struktur Proyek

```
Athenaeum/
├─ public/data/        # Data JSON (Mock API): books, loans, reservations, dll.
├─ src/
│  ├─ api/             # client.js (fetch) dan library.js (daftar endpoint)
│  ├─ assets/          # Gambar sampul buku, foto profil, dll.
│  ├─ components/      # Komponen umum (mis. DataState)
│  ├─ features/
│  │  ├─ auth/         # Login, session, penjaga rute per peran
│  │  ├─ user/         # Halaman pengguna
│  │  ├─ staff/        # Dashboard, Reservasi Ruang, Pinjaman Buku
│  │  └─ admin/        # Halaman admin
│  ├─ hooks/           # useFetch
│  └─ layouts/         # Layout per peran
└─ vite.config.js
```

## Catatan Mock API

- Semua data dibaca dari `public/data/*.json` lewat `fetch`, dengan status memuat/gagal + tombol coba lagi.
- Perubahan data di aplikasi (menambah pinjaman, menyetujui reservasi, dll.) **hanya tersimpan di memori** dan akan kembali seperti semula saat halaman dimuat ulang, karena file JSON statis tidak bisa ditulis dari browser.
- Untuk menyimpan permanen, hubungkan ke backend atau `json-server` pada tahap pengembangan berikutnya.

## Pemecahan Masalah

| Masalah | Solusi |
| --- | --- |
| `node` / `npm` tidak dikenali | Pasang Node.js dari <https://nodejs.org>, lalu tutup dan buka ulang terminal |
| Error versi Node (mis. `Vite requires Node.js 20.19+`) | Perbarui Node.js ke versi LTS terbaru |
| `npm install` gagal / error aneh | Hapus folder `node_modules`, lalu jalankan lagi `npm install` (file `package-lock.json` jangan dihapus) |
| Port 5173 sudah dipakai | Vite otomatis memakai port berikutnya; gunakan alamat yang tampil di terminal, atau `npm run dev -- --port 3000` |
| Halaman kosong setelah refresh di `/staff/...` pada hasil build | Gunakan `npm run preview` atau `npm run dev` (keduanya sudah menangani rute SPA) |
| Muncul layar "Gagal memuat data" | Pastikan server (`npm run dev`) masih berjalan dan file di `public/data/` tidak terhapus |

## Tim

Kelompok **Let's Larp** 
- 103022400141 - Muhammad Zaki
- 103022400056 - Muhammad Daffa Arifin
- 103022400063 - Muhammad Rasul
- 103022400107 - M. Rayhan Ramadhan Afdhani
- 103022400020 - Rayka Aqil Mumtaz
