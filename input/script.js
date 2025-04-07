const inputTabungan = document.getElementById('tabungan');
const inputNamaWarga = document.getElementById('nama');
const output = document.getElementById('output');
const form = document.getElementById('form-input');
const btnTambah = document.getElementById('btn-tambah');
const inputTotalTabungan = document.getElementById('totalTabungan');
const searchInput = document.getElementById('searchInput');
const btnSimpan = document.getElementById('btn-simpan');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const saveModal = document.getElementById('saveModal');
const modalTanggal = document.getElementById('modalTanggal');
const navHome = document.getElementById('navHome');

let editIndex = null;
let isDataSaved = true;

let dataWarga = JSON.parse(localStorage.getItem('warga')) || [];
let warga = []; // Data sementara yang akan ditambah
let savedData = JSON.parse(localStorage.getItem('savedTabunganData')) || [];

// Fungsi untuk menyimpan data ke localStorage
function saveData() {
    localStorage.setItem('warga', JSON.stringify(warga));
}

inputTotalTabungan.textContent = 'Rp 0';

// Fungsi untuk menyimpan total tabungan
function saveTabungan() {
    localStorage.setItem('savedTabunganData', JSON.stringify(savedData));
}


// Validasi input hanya angka
inputTabungan.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, ''); // Hanya izinkan angka
    let value = this.value;
    let formattedValue = formatRupiah(value, 'Rp ');
    this.value = formattedValue;
});

// Prevent spasi saat mengetik
inputTabungan.addEventListener('keydown', function (event) {
    if (event.key === ' ') {
        event.preventDefault();
    }
});

function formatRupiah(number, prefix) {
    let numberString = number.toString().replace(/[^,\d]/g, ''),
        split = numberString.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return prefix === undefined ? rupiah : prefix + rupiah;
}

// Fungsi untuk menghitung total tabungan
function calculateTotalTabungan() {
    let total = 0;

    warga.forEach((item) => {
        let angka = (item.tabungan || '').replace(/[^0-9]/g, ''); // Hilangkan format dengan aman
        total += parseInt(angka, 10);
    });

    // Tampilkan total dengan format Rupiah
    inputTotalTabungan.textContent = formatRupiah(total.toString(), 'Rp ');
}

// Fungsi untuk menambahkan atau mengedit data
function addData(event) {
    event.preventDefault();

    let namaWarga = inputNamaWarga.value.trim();
    let tabungan = inputTabungan.value.trim();

    

    if (namaWarga === '') {
        alert('Nama Warga Tidak Boleh Kosong');
        return;
    }

    // Validasi angka pada input tabungan
    let angkaTabungan = tabungan.replace(/[^0-9]/g, '');
    if (angkaTabungan === '' || parseInt(angkaTabungan, 10) <= -1) {
        alert('Tabungan harus diisi dengan angka positif');
        return;
    }

    // Cek apakah nama sudah ada dalam array warga (kecuali jika sedang dalam mode edit)
    let isDuplicate = warga.some((data, index) => data.namaWarga.toLowerCase() === namaWarga.toLowerCase() && index !== editIndex);

    if (isDuplicate) {
        alert('Nama warga sudah ada dalam daftar! Harap masukkan nama yang berbeda.');
        return;
    }

    if (editIndex === null) {
        // Mode tambah data baru
        let newData = {
            namaWarga: namaWarga,
            tabungan: tabungan,
        };
        warga.push(newData);
    } else {
        // Mode edit data
        warga[editIndex] = {
            namaWarga: namaWarga,
            tabungan: tabungan,
        };
        editIndex = null;
    }

    isDataSaved = false;
    calculateTotalTabungan();
    display();

    inputNamaWarga.value = '';
    inputTabungan.value = '';
}

// Fungsi untuk menampilkan data
function display() {
    output.innerHTML = '';

    let searchTerm = searchInput.value.trim().toLowerCase(); // Ambil kata pencarian

    let filteredData = warga.filter((data) => data.namaWarga.toLowerCase().includes(searchTerm));

    if (filteredData.length === 0 && warga.length > 0) {
        // Tampilkan gambar not-found hanya jika warga tidak kosong
        const not_found = document.createElement('h1');
        not_found.textContent = 'Data tidak ditemukan';
        not_found.style.textAlign = 'center';
        output.append(not_found);
    } else {
        filteredData.forEach((data, index) => {
            const listOutput = document.createElement('div');
            listOutput.classList.add('list');

            listOutput.innerHTML = 
                `<div class="listText">
                    <h3>${index + 1}. ${data.namaWarga}</h3>
                    <p>Jumlah Tabungan: ${data.tabungan}</p>
                </div>
                <div class="btnContainer">
                    <button id="editButton" onclick="editData(${index})" >Edit</button>
                    <button id="deleteButton" onclick="deleteData(${index})">Delete</button>
                </div>`
            ;

            output.append(listOutput);
        });
    }

    btnTambah.textContent = 'Tambah';
}
// Fungsi untuk mengedit data
function editData(index) {
    let editData = warga[index];
    inputNamaWarga.value = editData.namaWarga;
    inputTabungan.value = editData.tabungan;
    modalTanggal.value = editData.tanggal;

    editIndex = index;
    inputNamaWarga.focus();
    btnTambah.textContent = 'Edit';
}

// Fungsi untuk menghapus data
function deleteData(index) {
    warga.splice(index, 1);
    calculateTotalTabungan(); // Perbarui total tabungan
    display();
}

// Event listener untuk form submit
form.addEventListener('submit', addData);

// Event listener untuk modal "Simpan"
btnSimpan.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Fungsi untuk menyimpan data dari modal
saveModal.addEventListener('click', () => {
    const tanggalValue = modalTanggal.value;
    const savedTotal = inputTotalTabungan.textContent;

    // Tambahkan validasi: pastikan ada data yang diinputkan
    if (warga.length === 0) {
        alert('Tidak ada data warga yang diinputkan! Harap tambahkan data sebelum menyimpan.');
        return; // Hentikan proses penyimpanan
    }

    if (tanggalValue && savedTotal) {
        // Periksa apakah tanggal sudah ada di savedData
        const isDateExists = savedData.some((data) => data.tanggal === tanggalValue);

        if (isDateExists) {
            alert(`Data dengan tanggal ${tanggalValue} sudah ada! Silakan pilih tanggal lain.`);
            return; // Hentikan proses penyimpanan
        }

        // Tambahkan tanggal ke semua data di array warga
        warga = warga.map(item => ({
            ...item,
            tanggal: tanggalValue
        }));

        // Gabungkan data baru dengan data lama
        const updatedWarga = [...dataWarga, ...warga];
        const updatedSavedData = [
            ...savedData,
            {
                tanggal: tanggalValue,
                totalTabungan: savedTotal.replace(/[^0-9]/g, ''), // Simpan total sebagai angka murni
            }
        ];

        // Simpan data gabungan ke localStorage
        localStorage.setItem('warga', JSON.stringify(updatedWarga));
        localStorage.setItem('savedTabunganData', JSON.stringify(updatedSavedData));

        alert(`Data disimpan: Tanggal ${tanggalValue}, Total Tabungan ${savedTotal}`);
        modal.style.display = 'none';
        isDataSaved = true;

        // Redirect ke halaman index.html
        window.location.href = '../index.html';
    } else {
        alert('Tanggal atau total tabungan tidak boleh kosong!');
    }
});


window.addEventListener('beforeunload', (event) => {
    if (!isDataSaved) {
        event.preventDefault();
    }
});

// Menampilkan data awal
display();
calculateTotalTabungan();
searchInput.addEventListener('input', display);