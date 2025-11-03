Proyek Dashboard Sensor Logam Realtime

Aplikasi web ini memungkinkan Anda untuk:
- Melihat data sensor TDS (kadar terlarut) dan Turbidity (kekeruhan) secara realtime.
- Menyimpan data, lokasi, dan deskripsi ke dalam log historis.
- Melihat kembali semua data historis dalam bentuk grafik dan tabel.

🚀 Fitur Utama

Dashboard Realtime: Memantau data TDS dan Turbidity secara langsung dari sensor.
Indikator Status: Kode warna (hijau/kuning/merah) untuk menginterpretasikan risiko data secara visual.
Pencatatan Data Manual: Fitur untuk menyimpan snapshot data realtime ke database log permanen.
Pencatatan Lokasi Interaktif: Pengguna dapat meletakkan pin di peta untuk menandai lokasi pengambilan sampel (opsional).
Input Deskripsi: Pengguna wajib menambahkan deskripsi kontekstual untuk setiap log yang disimpan.
Halaman Laporan: Menampilkan semua data log historis dalam bentuk grafik tren dan tabel data.
Tombol Gmaps: Link dinamis di tabel laporan untuk membuka lokasi log di Google Maps.

📖 Tata Cara Penggunaan Aplikasi
1. Melihat Data Realtime
Pastikan perangkat sensor (ESP32) Anda telah menyala dan terhubung ke internet.
Buka website https://handrianw.github.io/bios2025_biosensoralga_biosensoralga.
Anda akan melihat halaman "Selamat Datang". Klik tombol "Masuk ke Dashboard".
Anda akan diarahkan ke halaman Dashboard.
Tunggu beberapa detik. Gauge TDS dan Turbidity akan otomatis diperbarui dengan data terbaru dari sensor Anda. Status risiko (AMAN, HATI-HATI, BAHAYA) juga akan berubah secara dinamis.

2. Menyimpan Catatan Log (di Halaman Dashboard)
Saat Anda berada di lokasi dan ingin mencatat data, ikuti langkah ini:
Saat Anda melihat data realtime yang ingin Anda simpan, klik tombol "Simpan Catatan (Data & Lokasi)".
Sebuah modal (popup) akan muncul, menampilkan data TDS, NTU, dan Tanggal saat ini.
(Opsional) Pilih Lokasi: Klik pada peta interaktif. Sebuah pin akan jatuh di lokasi yang Anda klik. Koordinat ini akan disimpan bersama log Anda.
(Wajib) Isi Deskripsi: Ketik deskripsi untuk log ini (misal: "Sampel air di muara sungai A"). Tombol "Simpan" akan tetap nonaktif sampai Anda mengisi ini.
Klik "Simpan". Data (termasuk lokasi opsional dan deskripsi wajib) akan disimpan ke database.

3. Melihat Laporan
Dari halaman manapun, klik tombol "Reports" di sidebar (menu sebelah kiri).
Anda akan diarahkan ke halaman reports.html.
Halaman ini akan otomatis memuat semua log yang pernah Anda (atau pengguna lain) simpan.
Anda dapat melihat statistik total (Rata-rata, Tertinggi), grafik tren, dan tabel lengkap dari semua data.
Jika sebuah log memiliki data lokasi, Anda akan melihat koordinatnya dan sebuah tombol ikon Google Maps. Klik tombol tersebut untuk membuka lokasi di tab baru.

📄 Lisensi

Didistribusikan di bawah Lisensi MIT.