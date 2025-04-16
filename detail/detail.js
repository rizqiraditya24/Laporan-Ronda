const dataContainer = document.getElementById('dataContainer');
const tanggalTitle = document.getElementById('tanggalTitle');
const totalTabungan = document.getElementById('totalTabungan');
const displayUsername = document.getElementById('displayUsername');

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Ambil user yang login

const formatTanggal = (tanggal) => {
    const bulanNama = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const date = new Date(tanggal);
    const hari = date.getDate();
    const bulan = bulanNama[date.getMonth()];
    const tahun = date.getFullYear();
    return `${hari} ${bulan} ${tahun}`;
};

const detailTanggal = localStorage.getItem('detailTanggal');
const dataWarga = JSON.parse(localStorage.getItem('warga')) || [];

tanggalTitle.textContent = `Tanggal : ${formatTanggal(detailTanggal)}`;
displayUsername.textContent = `Username : ${loggedInUser.username}`; // Tampilkan username yang login

// Filter data berdasarkan tanggal dan username yang login
const filteredWarga = dataWarga.filter(warga => {
    return (
        formatTanggal(warga.tanggal) === formatTanggal(detailTanggal) &&
        warga.username === loggedInUser.username
    );
});

let total = 0;
filteredWarga.forEach((warga, index) => {
    const nominal = parseInt(warga.tabungan.replace(/[^\d]/g, ''), 10); // Hapus Rp dan titik
    total += nominal;

    const div = document.createElement('div');
    div.classList.add('outputItem');
    div.innerHTML = `
        <h3>${index + 1}. ${warga.namaWarga}</h3>
        <p>${warga.tabungan}</p>
    `;
    dataContainer.appendChild(div);
});

totalTabungan.textContent = `Rp ${total.toLocaleString('id-ID')}`;

// Fungsi download gambar dari container
function downloadGambar() {
    const element = document.getElementById('container');

    html2canvas(element).then(function(canvas) {
        const link = document.createElement('a');
        link.download = 'detail-ronda.png'; // nama file
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}