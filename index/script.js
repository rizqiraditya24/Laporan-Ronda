const outputList = document.getElementById('output');
const searchOutput = document.getElementById('search');

// Ambil data dari localStorage
let savedData = JSON.parse(localStorage.getItem('savedTabunganData')) || [];
function saveTabungan() {
    localStorage.setItem('savedTabunganData', JSON.stringify(savedData));
}

let warga = []; // Data sementara yang akan ditambah
let dataWarga = JSON.parse(localStorage.getItem('warga')) || [];
function saveData() {
    localStorage.setItem('warga', JSON.stringify(warga));
}

// Fungsi untuk memformat tanggal
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
    const sortedData = savedData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    // Filter data berdasarkan tanggal yang sudah diformat
    const filteredData = sortedData.filter((data) => {
        const formattedDate = formatTanggal(data.tanggal).toLowerCase();
        return formattedDate.includes(searchTerm);
    });

    if (filteredData.length === 0) {
        const h1 = document.createElement('h1');
        h1.textContent = 'Data tidak ditemukan';
        h1.style.textAlign = 'center';
        outputList.appendChild(h1);
    }

    // Tampilkan data hasil filter
    filteredData.forEach((data, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('outputContent');
        listItem.innerHTML = `
        <div class="textOutput">
            <h3>${index + 1}. ${formatTanggal(data.tanggal)}</h3>
            <p>Jumlah Tabungan : Rp ${parseInt(data.totalTabungan, 10).toLocaleString('id-ID')}</p>
        </div>
        <div class="buttonOutput">
            <button onclick="editData(${index})" id="btnEdit">Edit</button>
            <button onclick="deleteData(${index})">Delete</button>
        </div>`;
        
        outputList.appendChild(listItem);
    });
}

function deleteData(index) {
    const tanggalTarget = savedData[index].tanggal;
    savedData.splice(index, 1);
    dataWarga = dataWarga.filter((warga) => warga.tanggal !== tanggalTarget);
    
    saveTabungan();
    saveData();
    display();
}

function editData(index) {
    // Ambil tanggal dari data yang dipilih
    const tanggalTarget = savedData[index].tanggal;

    // Simpan tanggal ke localStorage untuk digunakan di input.html
    localStorage.setItem('editTanggal', tanggalTarget);

    // Redirect ke halaman input.html
    window.location.href = '../edit/edit.html';
}


// Trigger pencarian ketika pengguna mengetik
searchOutput.addEventListener('input', display);
display();