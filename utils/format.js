function formatTimestamp(ts) {
    if (!ts) return 'Menunggu...';
    return new Date(ts).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

// Mengubah lat/lon menjadi string yang rapi
function formatLokasi(lat, lon) {
    if (lat && lon) {
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
    return 'N/A';
}