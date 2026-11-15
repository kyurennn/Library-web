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

## Alur Aplikasi
 
```
Buka aplikasi
     │
     ▼
 /login  ── pilih peran (Member / Staff / Admin), isi username & kata sandi
     │
     ├─ akun atau peran tidak cocok ──► pesan kesalahan, tetap di /login
     │
     ▼ (cocok)
 RequireRole memeriksa peran, lalu mengarahkan ke halaman awal peran:
     │
     ├─ Member ──► /        Beranda → Katalog → Detail Buku → Layanan & Fasilitas → Profil
     ├─ Staff  ──► /staff   Dashboard → Reservasi Ruang → Pinjaman Buku
     └─ Admin  ──► /admin   Book Manager → Dashboard → Reservasi Ruang → Staff Manajemen
 
 Keluar (semua peran) ──► sesi dihapus, kembali ke /login
```
 
Aturan akses:
- Belum login: semua rute dialihkan ke `/login`.
- Salah peran (mis. Member membuka `/admin`): dialihkan ke halaman awal perannya sendiri.
- Alamat yang tidak dikenal dialihkan ke `/`.
- Centang **Ingat saya** menyimpan sesi di `localStorage`; tanpa itu sesi hanya di `sessionStorage` (hilang saat tab ditutup).
## Penjelasan Halaman
 
### Umum
 
| Halaman | Rute | Penjelasan |
| --- | --- | --- |
| Login | `/login` | Memilih peran, mengisi username dan kata sandi, lalu masuk ke halaman awal sesuai peran. Opsi "Ingat saya" tersedia; tombol "Lupa kata sandi?" baru tampilan. |
 
### Member (pengguna)
 
| Halaman | Rute | Penjelasan |
| --- | --- | --- |
| Beranda | `/` | Koleksi buku, event dan berita perpustakaan. Kotak pencarian membawa pengguna ke katalog. |
| Katalog | `/catalog` | Mencari buku berdasarkan kata kunci dan penulis, memfilter kategori, mengurutkan, beralih tampilan grid/daftar, dan pindah halaman. Dapat diisi lewat parameter URL dari halaman lain. |
| Detail Buku | `/catalog/:id` | Informasi lengkap satu buku, dibuka dari kartu di katalog. |
| Layanan & Fasilitas | `/services` | Memilih Ruangan Pribadi atau Ruangan Meeting dan slot jadwal yang tersedia, serta melihat Reservasi Saya dan ketentuan reservasi. Tombol "Ajukan Reservasi" belum mengirim data. |
| Profil | `/profile` | Data akun, ubah data diri dan kata sandi, serta tombol Keluar. |
 
### Staff
 
| Halaman | Rute | Penjelasan |
| --- | --- | --- |
| Dashboard | `/staff` | Ringkasan pinjaman aktif, keterlambatan, reservasi menunggu, dan anggota aktif; grafik peminjaman 7 hari; Reservasi Menunggu Review; Jatuh Tempo Terdekat; Paling Sering Dipinjam (dihitung dari `loans.json` dan `books.json`, lengkap dengan sampul). |
| Reservasi Ruang | `/staff/reservations` | Ringkasan status, jadwal ruangan hari ini, dan daftar permohonan yang dapat dicari dan difilter. Menekan baris membuka popup detail dengan tombol **Setujui** dan **Tolak**; persetujuan diperiksa terhadap bentrok ruangan, hari, dan sesi. |
| Pinjaman Buku | `/staff/loans` | Daftar sirkulasi dengan filter (Semua, Dipinjam Normal, Jatuh Tempo Dekat, Terlambat) dan pencarian. Tombol **Tambah Pinjaman** membuka dialog dengan validasi (peminjam dan buku wajib dipilih, maksimal 3 pinjaman aktif per anggota, buku yang sama tidak boleh dipinjam dua kali oleh anggota yang sama, stok harus tersedia, tanggal tidak boleh melewati hari ini). Tombol **Dikembalikan** menandai buku kembali; denda Rp1.000 per hari terlambat dihitung otomatis. **Ekspor CSV** mengunduh daftar yang tampil. |
 
### Admin
 
| Halaman | Rute | Penjelasan |
| --- | --- | --- |
| Book Manager | `/admin`, `/admin/books` | Daftar koleksi dengan pencarian. **Tambah Buku** lewat modal, **Edit** membuka halaman edit, **Hapus** meminta konfirmasi dulu. |
| Edit Buku | `/admin/books/edit/:id` | Mengubah judul, penulis, tahun, rak, kategori, dan status buku; judul wajib diisi. |
| Dashboard | `/admin/dashboard` | Ringkasan operasional perpustakaan. |
| Reservasi Ruang | `/admin/reservations` | Memantau jadwal dan jumlah reservasi per status. Hanya untuk dilihat; persetujuan dilakukan staf. |
| Staff Manajemen | `/admin/staff` | Mengelola akun staf: tambah, edit, nonaktifkan, hapus, dan ekspor CSV, dengan validasi nama, email, ID, peran, shift, dan status. Admin terakhir yang aktif dan akun yang sedang dipakai tidak dapat dinonaktifkan. |
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
| NIM | Nama | GIT Username |
| --- | --- | --- |
| 103022400141 | Muhammad Zaki | Solar |
| 103022400056 | Muhammad Daffa Arifin | kyurennn |
| 103022400063 | Muhammad Rasul | Wild-Mane |
| 103022400107 | M. Rayhan Ramadhan Afdhani | RayhanAfdhani |
| 103022400020 | Rayka Aqil Mumtaz | RaykaAqil |

