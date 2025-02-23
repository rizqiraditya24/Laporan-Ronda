const output = document.getElementById('output');
const inputTabungan = document.getElementById('tabungan');
const inputTotalTabungan = document.getElementById('totalTabungan');
const editTanggal = localStorage.getItem('editTanggal');
const inputNamaWarga = document.getElementById('nama');
const form = document.getElementById('form-input');
const btnTambah = document.getElementById('btn-tambah');
const btnSimpan = document.getElementById('btn-simpan');
const navHome = document.getElementById('navHome');
const search = document.getElementById('searchInput');

let editIndex = null;
let isDataSaved = true;

// Ambil data dari localStorage
let savedData = JSON.parse(localStorage.getItem('savedTabunganData')) || [];
function saveTabungan() {
    localStorage.setItem('savedTabunganData', JSON.stringify(savedData));
}

let dataWarga = JSON.parse(localStorage.getItem('warga')) || [];
function saveData() {
    localStorage.setItem('warga', JSON.stringify(dataWarga));
}

// Filter data berdasarkan tanggal yang sedang diedit
let filteredWarga = dataWarga.filter((data) => data.tanggal === editTanggal);

// Format angka menjadi format Rupiah
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

// Hitung total tabungan dan langsung simpan ke localStorage
function calculateTotalTabungan(save = false) {
    let total = filteredWarga.reduce((sum, data) => {
        let numericValue = parseInt(data.tabungan.replace(/[^0-9]/g, ''), 10);
        return sum + numericValue;
    }, 0);

    inputTotalTabungan.textContent = formatRupiah(total, 'Rp ');

    if (save) {
        const DataIndex = savedData.findIndex((data) => data.tanggal === editTanggal);
        if (DataIndex !== -1) {
            savedData[DataIndex].totalTabungan = total;
        } else {
            savedData.push({ tanggal: editTanggal, totalTabungan: total });
        }
        saveTabungan();
    }
}

// Tambah data warga
function addData(event) {
    event.preventDefault();

    let namaWarga = inputNamaWarga.value.trim();
    let tabungan = inputTabungan.value.trim();

    if (namaWarga === '') {
        alert('Nama Warga Tidak Boleh Kosong');
        return;
    }

    let angkaTabungan = tabungan.replace(/[^0-9]/g, '');
    if (angkaTabungan === '' || parseInt(angkaTabungan, 10) <= 0) {
        alert('Tabungan harus diisi dengan angka positif');
        return;
    }

    let isDuplicate = filteredWarga.some((data, index) => data.namaWarga.toLowerCase() === namaWarga.toLowerCase() && index !== editIndex);

    if (isDuplicate) {
        alert('Nama warga sudah ada dalam daftar! Harap masukkan nama yang berbeda.');
        return;
    }

    if (editIndex === null) {
        let newData = {
            namaWarga: namaWarga,
            tabungan: tabungan,
            tanggal: editTanggal,
        };
        dataWarga.push(newData);
    } else {
        dataWarga[editIndex] = {
            namaWarga: namaWarga,
            tabungan: tabungan,
            tanggal: editTanggal,
        };
        editIndex = null;
    }

    filteredWarga = dataWarga.filter((data) => data.tanggal === editTanggal);

    isDataSaved = false;
    saveData();
    calculateTotalTabungan(true);
    displayEditData();

    inputNamaWarga.value = '';
    inputTabungan.value = '';
}

// Hapus data warga berdasarkan tanggal yang sama
function deleteData(index) {
    let deletedData = filteredWarga[index];

    dataWarga = dataWarga.filter(data => !(data.namaWarga === deletedData.namaWarga && data.tanggal === editTanggal));

    filteredWarga = dataWarga.filter((data) => data.tanggal === editTanggal);

    saveData();
    isDataSaved = false;
    calculateTotalTabungan(true);
    displayEditData();
}

// Tampilkan data di halaman
function displayEditData(searchQuery = '') {
    output.innerHTML = '';

    let displayedData = filteredWarga.filter(data =>
        data.namaWarga.toLowerCase().includes(searchQuery)
    );

    if (displayedData.length === 0) {
        const h1 = document.createElement('h1');
        h1.textContent = 'Tidak ada data warga ditemukan.';
        h1.style.textAlign = 'center';
        output.appendChild(h1);
        return;
    }

    displayedData.forEach((data, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('list');
        listItem.innerHTML = 
          `<div class="listText">
                <h3>${index + 1}. ${data.namaWarga}</h3>
                <p>Jumlah Tabungan: ${data.tabungan}</p>
            </div>
            <button id="editButton" onclick="editData(${filteredWarga.indexOf(data)})">Edit</button>
            <button id="deleteButton" onclick="deleteData(${filteredWarga.indexOf(data)})">Delete</button>`;

        output.appendChild(listItem);
    });

    calculateTotalTabungan(true);
    btnTambah.textContent = 'Tambah';
}

// Edit data warga
function editData(index) {
    let dataToEdit = filteredWarga[index];

    inputNamaWarga.value = dataToEdit.namaWarga;
    inputTabungan.value = dataToEdit.tabungan;

    editIndex = dataWarga.findIndex(
        (data) =>
            data.namaWarga === dataToEdit.namaWarga &&
            data.tabungan === dataToEdit.tabungan &&
            data.tanggal === dataToEdit.tanggal
    );

    inputNamaWarga.focus();
    btnTambah.textContent = 'Edit';
}

// Fungsi untuk menyimpan data dan berpindah halaman
btnSimpan.addEventListener('click', function () {
    isDataSaved = true;
    saveData();
    saveTabungan();

    alert('Data berhasil disimpan!');
    window.location.href = '../index.html';
});

// Tambahkan event listener untuk pencarian
search.addEventListener('input', function () {
    displayEditData(this.value.trim().toLowerCase());
});

// Cegah navigasi sebelum data disimpan
navHome.addEventListener('click', (event) => {
    if (!isDataSaved) {
        alert('Data belum disimpan! Harap simpan data terlebih dahulu.');
        event.preventDefault();
    }
});

// Cegah kembali sebelum data disimpan
window.addEventListener('popstate', function (event) {
    if (!isDataSaved) {
        alert('Data belum disimpan! Harap simpan data terlebih dahulu.');
        history.pushState(null, '', location.href);
    }
});

// Kunci tombol kembali
function lockBackButton() {
    history.pushState(null, '', location.href);
    history.pushState(null, '', location.href);
}

lockBackButton();

// Event listener untuk form
form.addEventListener('submit', addData);

// Tampilkan data saat halaman dimuat
displayEditData();
