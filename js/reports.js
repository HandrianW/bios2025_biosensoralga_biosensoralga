        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore(); // Hanya perlu Firestore
        
        // 4c. Variabel Global & Inisialisasi Chart
        let myChart; 
        let currentData = []; 
        const ctx = document.getElementById('historyChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], 
                datasets: [
                    {
                        label: 'TDS (ppm)', data: [],
                        borderColor: 'rgb(37, 99, 235)', // accent-blue
                        backgroundColor: 'rgba(37, 99, 235, 0.5)',
                        yAxisID: 'yTDS',
                    },
                    {
                        label: 'Turbidity (NTU)', data: [],
                        borderColor: 'rgb(234, 179, 8)', // yellow-500
                        backgroundColor: 'rgba(234, 179, 8, 0.5)',
                        yAxisID: 'yNTU',
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { type: 'time', time: { unit: 'day', tooltipFormat: 'PP pp' }, title: { display: true, text: 'Waktu' } },
                    yTDS: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'TDS (ppm)' } },
                    yNTU: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Turbidity (NTU)' }, grid: { drawOnChartArea: false } }
                }
            }
        });
        
        // 4d. Fungsi Utilitas (Disertakan di sini)
        function formatTimestamp(ts) {
            if (!ts) return 'Menunggu...';
            return new Date(ts).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        }

        function formatLokasi(lat, lon) {
            if (lat && lon) {
                return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            }
            return 'N/A'; // Akan menampilkan N/A jika latitude/longitude bernilai null
        }

        // 4e. Fungsi Utama (DIUBAH: Tanpa filter waktu)
        function fetchReportData() {
            document.querySelector("#data-table tbody").innerHTML = '<tr><td colspan="5" class="text-center p-4">Memuat data...</td></tr>';
            
            // Mengambil SEMUA log, diurutkan berdasarkan timestamp terbaru
            db.collection("sensor_logs")
              .orderBy("timestamp", "desc") // <-- Mengambil data terbaru dulu
              // .limit(100) // <-- Opsional: Batasi hingga 100 log terakhir jika datanya terlalu banyak
              .get()
              .then((querySnapshot) => {
                
                if (querySnapshot.empty) {
                    console.log("Tidak ada data log ditemukan.");
                    document.querySelector("#data-table tbody").innerHTML = '<tr><td colspan="5" class="text-center p-4">Tidak ada data ditemukan.</td></tr>';
                    updateStats([]);
                    updateChart([]);
                    updateTable([]);
                    return;
                }
                
                currentData = []; 
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const timestampInMillis = data.timestamp ? data.timestamp.toMillis() : Date.now();
                    
                    currentData.push({
                        key: doc.id,
                        ts: timestampInMillis,
                        tds: data.tds_ppm,
                        ntu: data.turbidity_ntu,
                        latitude: data.latitude,   // Akan 'undefined' atau 'null' jika tidak ada
                        longitude: data.longitude, // Akan 'undefined' atau 'null' jika tidak ada
                        deskripsi: data.deskripsi
                    });
                });
                
                // Urutkan (asc) untuk chart
                const chartData = [...currentData].sort((a, b) => a.ts - b.ts);
                
                // Data untuk tabel (desc) tidak perlu di-sort ulang
                updateStats(currentData);
                updateChart(chartData);
                updateTable(currentData); // currentData sudah 'desc' dari query
                
            })
            .catch((error) => {
                console.error("Gagal mengambil data log: ", error);
                document.querySelector("#data-table tbody").innerHTML = '<tr><td colspan="5" class="text-center p-4">Gagal memuat data.</td></tr>';
            });
        }
        
        // --- updateStats dan updateChart ---
        function updateStats(data) {
            if (data.length === 0) {
                 document.getElementById('avg-tds').innerText = 'N/A';
                 document.getElementById('max-tds').innerText = 'N/A';
                 document.getElementById('avg-ntu').innerText = 'N/A';
                return;
            }
            let totalTDS = 0, maxTDS = data[0].tds, totalNTU = 0;
            data.forEach(d => {
                totalTDS += d.tds;
                totalNTU += d.ntu;
                if (d.tds > maxTDS) maxTDS = d.tds;
            });
            document.getElementById('avg-tds').innerText = (totalTDS / data.length).toFixed(0);
            document.getElementById('max-tds').innerText = maxTDS.toFixed(0);
            document.getElementById('avg-ntu').innerText = (totalNTU / data.length).toFixed(1);
        }
        function updateChart(data) {
            myChart.data.labels = data.map(d => d.ts);
            myChart.data.datasets[0].data = data.map(d => d.tds);
            myChart.data.datasets[1].data = data.map(d => d.ntu);
            myChart.update();
        }
        
        // --- updateTable (Read-Only + Tombol Gmaps) ---
        function updateTable(data) {
            const tableBody = document.querySelector("#data-table tbody");
            tableBody.innerHTML = "";
            
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Tidak ada data ditemukan.</td></tr>';
                return;
            }
            
            // data sudah diurutkan (desc) dari query
            data.forEach(d => {
                const date = formatTimestamp(d.ts); 
                const lokasiText = formatLokasi(d.latitude, d.longitude); // Dari utils
                let deskripsiHtml = d.deskripsi || 'N/A';

                // --- Fitur Baru: Tambahkan tombol Gmaps ---
                let lokasiHtml = '';
                if (d.latitude && d.longitude) {
                    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${d.latitude},${d.longitude}`;
                    lokasiHtml = `
                        <div class="flex items-center justify-between">
                            <span>${lokasiText}</span>
                            <a href="${gmapsUrl}" target="_blank" title="Buka di Google Maps"
                               class="ml-2 p-1 inline-block bg-accent-blue text-white rounded-md hover:bg-accent-blue/80">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </a>
                        </div>
                    `;
                } else {
                    lokasiHtml = 'N/A';
                }
                
                const row = `
                    <tr class="border-b border-gray-200/50 hover:bg-gray-100/50">
                        <td class="py-2 px-4">${date}</td>
                        <td class="py-2 px-4 text-center">${d.tds.toFixed(0)}</td>
                        <td class="py-2 px-4 text-center">${d.ntu.toFixed(1)}</td>
                        <td class="py-2 px-4">${lokasiHtml}</td>
                        <td class="py-2 px-4">${deskripsiHtml}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
        
        // --- EVENT LISTENERS TOMBOL FILTER DIHAPUS ---

        // Muat semua data saat halaman dibuka
        fetchReportData();
