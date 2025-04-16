const outputList = document.getElementById('output');
const searchOutput = document.getElementById('search');
const filterBulan = document.getElementById('filterBulan');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');

let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || [];

let savedData = JSON.parse(localStorage.getItem('savedTabunganData')) || [];
function saveTabungan() {
    localStorage.setItem('savedTabunganData', JSON.stringify(savedData));
}

let dataWarga = JSON.parse(localStorage.getItem('warga')) || [];
function saveData() {
    localStorage.setItem('warga', JSON.stringify(dataWarga));
}

function formatTanggal(tanggal) {
    const bulanNama = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const date = new Date(tanggal);
    const hari = date.getDate();
    const bulan = bulanNama[date.getMonth()];
    const tahun = date.getFullYear();

    return `${hari} ${bulan} ${tahun}`;
}

function display() {
    outputList.innerHTML = '';

    const searchTerm = searchOutput.value.trim().toLowerCase();
    const selectedBulan = filterBulan.value;

    const sortedData = savedData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    const filteredData = sortedData.filter((data) => {
        const formattedDate = formatTanggal(data.tanggal).toLowerCase();
        const bulanData = new Date(data.tanggal).getMonth();

        const isSearchMatch = formattedDate.includes(searchTerm);
        const isBulanMatch = selectedBulan === "" || bulanData == selectedBulan;

        const isUserMatch = data.username === loggedInUser.username; // Filter berdasarkan username login

        return isSearchMatch && isBulanMatch && isUserMatch;
    });

    if (filteredData.length === 0) {
        const h1 = document.createElement('h1');
        h1.textContent = 'Data tidak ditemukan';
        h1.classList.add('notFound');
        outputList.appendChild(h1);
    }

    filteredData.forEach((data, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('outputContent');
        listItem.innerHTML = `
        <div>
            <h3>${index + 1}. ${formatTanggal(data.tanggal)}</h3>
            <p>Jumlah Tabungan : Rp ${parseInt(data.totalTabungan, 10).toLocaleString('id-ID')}</p>
        </div>
        <div id="btnContainer">
            <button onclick="editData(${index})" id="btnEdit">
                <img src="/img/icon_edit.svg" alt="Edit">
            </button>

            <button onclick="deleteData(${index})">
                <img src="/img/icon_delete.svg" alt="Delete">
            </button>

            <button onclick="viewDetail('${data.tanggal}')" id="btnView">
                <img src="/img/icon_detail2.svg" alt="Detail">
            </button>
        </div>`;    

        outputList.appendChild(listItem);
    });
}


function deleteData(index) {
    const tanggalTarget = savedData[index].tanggal;
    const username = loggedInUser.username;

    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus semua data tabungan Anda pada tanggal ${formatTanggal(tanggalTarget)}?`);
    if (!confirmDelete) return;

    // Hapus hanya dari savedData milik user dan tanggal yang sesuai
    savedData = savedData.filter((item) =>
        !(item.tanggal === tanggalTarget && item.username === username)
    );

    // Hapus dari dataWarga yang memiliki username dan tanggal yang sama
    dataWarga = dataWarga.filter((warga) =>
        !(warga.tanggal === tanggalTarget && warga.username === username)
    );

    saveTabungan();
    saveData();
    display();
}


function editData(index) {
    const tanggalTarget = savedData[index].tanggal;
    localStorage.setItem('editTanggal', tanggalTarget);
    window.location.href = '/edit/edit.html';
}

function viewDetail(tanggal) {
    localStorage.setItem('detailTanggal', tanggal);
    window.location.href = '/detail/detail.html';
}

searchOutput.addEventListener('input', display);
filterBulan.addEventListener('change', display);

// Tampilkan/sembunyikan menu dropdown saat gambar diklik
profileBtn.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Tutup dropdown jika klik di luar elemen
window.addEventListener('click', function (e) {
    if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// Fungsi logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser'); // hapus data user
    window.location.href = '../index.html'; // arahkan ke halaman login
});

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "/auth/login.html"; // Atau halaman login kamu
    }
});


display();