/*
 * public/js/dashboard.js
 * Logika utama untuk halaman dashboard (dashboard.html)
 *
 * FITUR TAMBAHAN:
 * - Data Turbiditas dimanipulasi secara lokal di browser
 * untuk tujuan testing (naik-turun setiap 1 menit).
 */

// 4b. Inisialisasi Firebase
// Variabel 'firebaseConfig' diambil dari file 'js/firebase-config.js'
// yang dimuat sebelum skrip ini di file HTML.
firebase.initializeApp(firebaseConfig);
const database = firebase.database();  // Untuk data realtime
const db = firebase.firestore();      // Untuk menyimpan log

// 4c. Referensi Elemen (Bagian Utama)
const tdsValueEl = document.getElementById('tds-value');
const tdsStatusEl = document.getElementById('tds-status-text');
const tdsGaugeEl = document.getElementById('tds-gauge');
const tdsBoxEl = document.getElementById('tds-box');
const ntuValueEl = document.getElementById('ntu-value');
const ntuStatusEl = document.getElementById('ntu-status-text');
const ntuGaugeEl = document.getElementById('ntu-gauge');
const ntuBoxEl = document.getElementById('ntu-box');
const statusBoxEl = document.getElementById('status-box-main');
const overallStatusEl = document.getElementById('overall-status-text');
const overallRecEl = document.getElementById('overall-recommendation');
const drinkabilityEl = document.getElementById('drinkability-status');
const timestampEl = document.getElementById('timestamp');

// Referensi Elemen Modal
const btnBukaModal = document.getElementById('btn-buka-modal');
const modalSimpan = document.getElementById('modal-simpan');
const modalContent = document.getElementById('modal-content');
const btnModalBatal = document.getElementById('btn-modal-batal');
const btnModalSimpan = document.getElementById('btn-modal-simpan');
const modalDataDisplay = document.getElementById('modal-data-display');
const modalTanggalDisplay = document.getElementById('modal-tanggal-display');
const modalLocationDisplay = document.getElementById('modal-location-display');
const modalDeskripsi = document.getElementById('modal-deskripsi');

// Variabel Global
let currentGpsLocation = null; // Koordinat dari pin peta (opsional)
let currentRealtimeData = null; // Data dari /data_sensor_realtime
let mapInstance = null; // Variabel untuk peta
let mapMarker = null;   // Variabel untuk pin

// 4d. Listener Firebase (Realtime)
const liveDataRef = database.ref('/data_sensor_realtime');
liveDataRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return; 

    // Simpan data terbaru ke variabel global
    // Kita simpan data *sebelum* dimanipulasi
    currentRealtimeData = data; 
    
    // --- (Logika untuk memperbarui gauge dan status) ---

    // =======================================================
    // --- MULAI BLOK SIMULASI DATA (UNTUK TESTING) ---
    // =======================================================
    // Kita ambil data TDS asli dari ESP32
    const tdsValue = data.tds_ppm;
    
    // Kita BUANG data turbidity_ntu yang asli dan kita buat data palsu
    let ntuValue;
    // Dapatkan waktu saat ini di browser dalam siklus 2 menit (120,000 milidetik)
    const timeInCycle = new Date().getTime() % 120000; 

    if (timeInCycle < 60000) {
        // MENIT PERTAMA: Beri nilai RENDAH (DI BAWAH 1)
        // Angka acak antara 0.1 dan 0.9
        ntuValue = (Math.random() * (0.9 - 0.1) + 0.1);
    } else {
        // MENIT KEDUA: Beri nilai TINGGI (DI ATAS 1)
        // Angka acak antara 1.1 dan 4.9 (untuk menguji status "Cukup")
        ntuValue = (Math.random() * (4.9 - 1.1) + 1.1);
    }
    
    // Simpan juga data simulasi ke data 'realtime'
    // agar jika user menekan "Simpan", data simulasilah yang tersimpan.
    currentRealtimeData.turbidity_ntu = ntuValue;
    
    // =======================================================
    // --- AKHIR BLOK SIMULASI DATA ---
    // =======================================================
    
    let tdsClass = '', tdsGaugeClass = '', tdsTextClass = '';
    let tdsStatus = '';
    let ntuClass = '', ntuGaugeClass = '', ntuTextClass = '';
    let ntuStatus = '';
    let overallClass = '', overallStatus = '', overallRec = '', drinkabilityStatus = '';

    // Proses TDS (Menggunakan data asli)
    let tdsGauge = (tdsValue / 1000) * 100;
    if (tdsGauge > 100) tdsGauge = 100;
    if (tdsValue < 300) {
        tdsClass = 'card_aman'; tdsGaugeClass = 'gauge_aman'; tdsTextClass = 'text_aman';
        tdsStatus = 'Risiko Rendah';
    } else if (tdsValue < 500) {
        tdsClass = 'card_cukup'; tdsGaugeClass = 'gauge_cukup'; tdsTextClass = 'text_cukup';
        tdsStatus = 'Risiko Moderat';
    } else {
        tdsClass = 'card_bahaya'; tdsGaugeClass = 'gauge_bahaya'; tdsTextClass = 'text_bahaya';
        tdsStatus = 'Risiko Tinggi';
    }

    // Proses Turbidity (Menggunakan data SIMULASI)
    let ntuGauge = (ntuValue / 10) * 100; // Gauge max diset ke 10
    if (ntuGauge > 100) ntuGauge = 100;
    if (ntuValue < 1) {
        ntuClass = 'card_aman'; ntuGaugeClass = 'gauge_aman'; ntuTextClass = 'text_aman';
        ntuStatus = 'Jernih (Risiko Rendah)';
    } else if (ntuValue < 5) {
        ntuClass = 'card_cukup'; ntuGaugeClass = 'gauge_cukup'; ntuTextClass = 'text_cukup';
        ntuStatus = 'Agak Keruh (Risiko Moderat)';
    } else {
        ntuClass = 'card_bahaya'; ntuGaugeClass = 'gauge_bahaya'; ntuTextClass = 'text_bahaya';
        ntuStatus = 'Sangat Keruh (Risiko Tinggi)';
    }

    // Proses Status Keseluruhan
    if (tdsClass === 'card_bahaya') {
        overallClass = 'status_bahaya'; overallStatus = 'RISIKO LOGAM TINGGI';
        overallRec = 'TDS sangat tinggi. Sangat disarankan uji lab untuk logam berat!';
    } else if (tdsClass === 'card_cukup') {
        overallClass = 'status_cukup'; overallStatus = 'RISIKO LOGAM MODERAT';
        overallRec = 'TDS cukup tinggi. Ada kemungkinan mengandung logam.';
    } else {
        overallClass = 'status_aman'; overallStatus = 'RISIKO LOGAM RENDAH';
        overallRec = 'TDS rendah, kemungkinan logam berat terlarut rendah.';
    }

    // Proses Kelayakan Minum
    if (tdsClass === 'card_bahaya' || ntuClass === 'card_bahaya') {
        drinkabilityStatus = 'Kelayakan Minum: SANGAT TIDAK DISARANKAN';
    } else if (tdsClass === 'card_cukup' || ntuClass === 'card_cukup') {
        drinkabilityStatus = 'Kelayakan Minum: Disarankan dimasak / filtrasi dahulu';
    } else {
        drinkabilityStatus = 'Kelayakan Minum: Aman (sesuai standar TDS & Kekeruhan)';
    }

    // Update Tampilan (DOM)
    tdsValueEl.innerText = tdsValue.toFixed(0);
    tdsStatusEl.innerText = tdsStatus;
    tdsBoxEl.className = 'bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-md border-l-8 ' + tdsClass;
    tdsGaugeEl.className = 'w-full rounded-full ' + tdsGaugeClass;
    tdsGaugeEl.style.height = tdsGauge + '%';
    tdsValueEl.className = 'text-6xl font-bold ' + tdsTextClass;
    tdsStatusEl.className = 'font-bold text-xl mt-2 ' + tdsTextClass;
    
    // Update Turbidity dengan nilai simulasi
    ntuValueEl.innerText = ntuValue.toFixed(1); // Tampilkan 1 desimal agar 0.x terlihat
    ntuStatusEl.innerText = ntuStatus;
    ntuBoxEl.className = 'bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-md border-l-8 ' + ntuClass;
    ntuGaugeEl.className = 'w-full rounded-full ' + ntuGaugeClass;
    ntuGaugeEl.style.height = ntuGauge + '%';
    ntuValueEl.className = 'text-6xl font-bold ' + ntuTextClass;
    ntuStatusEl.className = 'font-bold text-xl mt-2 ' + ntuTextClass;
    
    statusBoxEl.className = 'p-6 rounded-lg shadow-lg text-white text-center mb-6 ' + overallClass;
    overallStatusEl.innerText = overallStatus;
    overallRecEl.innerText = overallRec;
    drinkabilityEl.innerText = drinkabilityStatus;
    
    if(data.timestamp) {
        const timestamp = new Date(data.timestamp);
        timestampEl.innerText = "Update Terakhir: " + timestamp.toLocaleString('id-ID');
    } else {
        timestampEl.innerText = "Menunggu data timestamp...";
    }

});

// --- 5. FUNGSI-FUNGSI BARU UNTUK MODAL ---

function checkModalSaveButtonState() {
    // Tombol simpan aktif HANYA JIKA DESKRIPSI diisi.
    if (modalDeskripsi.value.trim() !== "") {
        btnModalSimpan.disabled = false;
    } else {
        btnModalSimpan.disabled = true;
    }
}

function openSimpanModal() {
    if (!currentRealtimeData) {
        alert("Belum ada data realtime. Tunggu sensor mengirim data.");
        return;
    }
    // Reset status modal
    currentGpsLocation = null;
    modalDeskripsi.value = "";
    modalLocationDisplay.innerHTML = 'Lokasi: <span class="text-gray-500 font-normal">Opsional. Klik peta untuk memilih.</span>';
    btnModalSimpan.disabled = true; // Tombol nonaktif sampai deskripsi diisi

    // Isi data sensor & tanggal (Data NTU akan terisi data simulasi)
    modalDataDisplay.innerText = `TDS: ${currentRealtimeData.tds_ppm.toFixed(0)} ppm | NTU: ${currentRealtimeData.turbidity_ntu.toFixed(1)} NTU`;
    modalTanggalDisplay.innerText = "Tanggal: " + new Date().toLocaleString('id-ID');
    
    // Tampilkan modal
    modalSimpan.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
        initMap();
    }, 10);
}

function initMap() {
    if (!mapInstance) {
        mapInstance = L.map('map-picker').setView([-2.5489, 118.0149], 5); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="http://googleusercontent.com/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);
        mapInstance.on('click', onMapClick);
    }
    if (mapMarker) {
        mapMarker.remove();
        mapMarker = null;
    }
    setTimeout(() => {
        // Penting: Peta harus di-refresh ukurannya setelah modal muncul
        if (mapInstance) {
            mapInstance.invalidateSize();
        }
    }, 100);
}

function onMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    currentGpsLocation = { lat: lat, lon: lon };
    if (mapMarker) {
        mapMarker.remove();
    }
    mapMarker = L.marker([lat, lon]).addTo(mapInstance);
    modalLocationDisplay.innerHTML = `Lokasi: <span class="text-green-600 font-bold">${lat.toFixed(4)}, ${lon.toFixed(4)}</span> (Tersimpan)`;
}

function closeSimpanModal() {
    modalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modalSimpan.classList.add('hidden');
    }, 200);
}

function handleModalSimpanClick() {
    const deskripsi = modalDeskripsi.value.trim();

    // Validasi: Deskripsi Wajib, data realtime harus ada.
    if (deskripsi === "" || !currentRealtimeData) {
        alert("Gagal. Pastikan deskripsi sudah diisi.");
        return;
    }

    btnModalSimpan.disabled = true;
    btnModalSimpan.innerText = "Menyimpan...";
    
    // Siapkan data lengkap untuk disimpan
    const logData = {
        tds_ppm: currentRealtimeData.tds_ppm,
        turbidity_ntu: currentRealtimeData.turbidity_ntu, // Ini akan berisi data simulasi
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        deskripsi: deskripsi,
        latitude: currentGpsLocation ? currentGpsLocation.lat : null,
        longitude: currentGpsLocation ? currentGpsLocation.lon : null
    };
    
    // Simpan ke Firestore
    db.collection("sensor_logs").add(logData)
    .then((docRef) => {
        console.log("Log tersimpan dengan ID: ", docRef.id);
        alert("Sukses! Data log baru telah disimpan.");
        btnModalSimpan.innerText = "Simpan";
        closeSimpanModal();
    })
    .catch((error) => {
        console.error("Gagal menyimpan ke Firestore: ", error);
        alert("Gagal menyimpan data ke Firebase.");
        btnModalSimpan.innerText = "Simpan";
        btnModalSimpan.disabled = false;
    });
}

// --- 6. EVENT LISTENERS ---
// Pastikan elemen-elemen ini ada sebelum menambahkan listener
if (btnBukaModal) {
    btnBukaModal.addEventListener('click', openSimpanModal);
    btnModalBatal.addEventListener('click', closeSimpanModal);
    btnModalSimpan.addEventListener('click', handleModalSimpanClick);
    
    // Cek tombol simpan setiap kali deskripsi diketik
    modalDeskripsi.addEventListener('input', checkModalSaveButtonState);
}

