# 🍱 SmartCanteen 

Aplikasi web *pre-order* makanan kantin (*mobile-first*) untuk **Kantin FILKOM UB** yang memungkinkan pengguna memesan makanan terlebih dahulu, memilih jam pengambilan, dan mengambil pesanan tanpa antre.

Dibangun menggunakan **HTML5, CSS3 murni, dan Vanilla JavaScript** tanpa *framework* eksternal agar ringan, mudah dipahami, dan cepat dikembangkan.

---

## ✨ Fitur & Alur Halaman

1. **Beranda (`index.html`)**
   - Pencarian kios dan menu secara *real-time*.
   - Filter kategori cepat (*Semua, Makanan, Minuman, Snack*).
   - Daftar **Kios Populer** dan **Semua Kios** (lengkap dengan status buka/tutup, estimasi waktu siap, dan rating).
   - Kartu pintasan **Pesanan Aktif** yang otomatis muncul jika ada transaksi berjalan.

2. **Menu Kios (`menu.html`)**
   - Informasi detail kios, estimasi waktu masak, dan pencarian menu spesifik di dalam kios.
   - Tab kategori dinamis menyesuaikan daftar menu kios yang dipilih.
   - Kontrol jumlah porsi (`+` / `-`), penanda menu *Habis*, dan *sticky cart bar* dengan kalkulasi total otomatis.

3. **Pilih Jam Ambil & Pembayaran (`slot.html`)**
   - Pemilihan slot waktu pengambilan (dengan indikator slot *Penuh* dan *Hampir penuh*).
   - Input catatan tambahan untuk penjual dan pilihan metode pembayaran (*QRIS, Bayar di kasir, Dompet digital*).
   - Validasi form otomatis sebelum konfirmasi pesanan.

4. **Status Pesanan (`status.html`)**
   - Simulasi progres pesanan otomatis (*Diterima → Dimasak → Siap diambil → Selesai*).
   - Generator kode ambil unik beserta QR Code SVG dinamis.
   - Rincian item pesanan, tombol konfirmasi pengambilan, dan reset transaksi baru.

---

## 📁 Struktur Proyek

```text
smartcanteen-rush/
├── index.html      # Halaman Beranda
├── index.css       # Styling khusus Beranda
├── menu.html       # Halaman Daftar Menu Kios
├── menu.css        # Styling khusus Menu
├── slot.html       # Halaman Pilih Jam Ambil & Pembayaran
├── slot.css        # Styling khusus Slot
├── status.html     # Halaman Pelacakan Status Pesanan
├── status.css      # Styling khusus Status
├── script.js       # Pusat logika, data katalog, & state (localStorage)
└── README.md       # Dokumentasi proyek
