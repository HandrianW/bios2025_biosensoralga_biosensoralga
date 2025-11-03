/*
 * js/main.js
 * Logika ini mengontrol sidebar mobile (drawer).
 */

// Menjalankan kode saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // Temukan elemen-elemen yang kita perlukan
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openMenuBtn = document.getElementById('btn-menu-open');
    
    // Fungsi untuk membuka sidebar
    function openSidebar() {
        if (sidebar && overlay) {
            sidebar.classList.remove('-translate-x-full'); // Geser sidebar ke dalam layar
            overlay.classList.remove('hidden'); // Tampilkan overlay gelap
        }
    }

    // Fungsi untuk menutup sidebar
    function closeSidebar() {
        if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full'); // Geser sidebar ke luar layar
            overlay.classList.add('hidden'); // Sembunyikan overlay gelap
        }
    }

    // Tambahkan listener ke tombol "hamburger"
    if (openMenuBtn) {
        openMenuBtn.addEventListener('click', openSidebar);
    }

    // Tambahkan listener ke overlay (agar bisa ditutup saat diklik di luar)
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // (Opsional) Tutup sidebar saat link di-klik
    const sidebarLinks = document.querySelectorAll('#sidebar nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
});