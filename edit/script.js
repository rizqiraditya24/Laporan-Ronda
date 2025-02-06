const output = document.getElementById('output');
const inputTabungan = document.getElementById('tabungan');
const inputTotalTabungan = document.getElementById('totalTabungan');
const editTanggal = localStorage.getItem('editTanggal');
const inputNamaWarga = document.getElementById('nama');
const form = document.getElementById('form-input');
const btnTambah = document.getElementById('btn-tambah');
const btnSimpan = document.getElementById('btn-simpan');
const navHome = document.getElementById('navHome');

let editIndex = null;
let isDataSaved = true;

let savedData = JSON.parse(localStorage.getItem('savedTabunganData')) || [];
function saveTabungan() {
    localStorage.setItem('savedTabunganData', JSON.stringify(savedData));
}

let dataWarga = JSON.parse(localStorage.getItem('warga')) || [];
function saveData() {
    localStorage.setItem('warga', JSON.stringify(dataWarga));
}

inputTotalTabungan.textContent = 'Rp 0';

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

// Filter data warga berdasarkan tanggal yang sama
let filteredWarga = dataWarga.filter((data) => data.tanggal === editTanggal);

// Hitung total tabungan
function calculateTotalTabungan() {
    let total = filteredWarga.reduce((sum, data) => {
        let numericValue = parseInt(data.tabungan.replace(/[^0-9]/g, ''), 10);
        return sum + numericValue;
    }, 0);

    inputTotalTabungan.textContent = formatRupiah(total, 'Rp ');
}

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

    if (editIndex === null) {
        let newData = {
            namaWarga: namaWarga,
            tabungan: tabungan,
            tanggal: editTanggal,
        };
        dataWarga.push(newData);
        filteredWarga.push(newData);
    } else {
        dataWarga[editIndex] = {
            namaWarga: namaWarga,
            tabungan: tabungan,
            tanggal: editTanggal,
        };

        filteredWarga = dataWarga.filter((data) => data.tanggal === editTanggal);
        editIndex = null;
    }

    isDataSaved = false;
    saveData();
    calculateTotalTabungan();
    displayEditData();

    inputNamaWarga.value = '';
    inputTabungan.value = '';
}

function displayEditData() {
    output.innerHTML = '';

    if (filteredWarga.length === 0) {
        const h1 = document.createElement('h1');
        h1.textContent = 'Tidak ada data warga ditemukan.';
        h1.style.textAlign = 'center';
        output.appendChild(h1);
        return;
    }

    filteredWarga.forEach((data, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('list');
        listItem.innerHTML = `
           <div class="listText">
                <h3>${index + 1}. ${data.namaWarga}</h3>
                <p>Jumlah Tabungan: ${data.tabungan}</p>
            </div>
            <button id="editButton" onclick="editData(${index})">Edit</button>
            <button id="deleteButton" onclick="deleteData(${index})">Delete</button>
        `;

        output.appendChild(listItem);
    });

    calculateTotalTabungan();
    btnTambah.textContent = 'Tambah';
}

function deleteData(index) {
    let deletedData = filteredWarga[index];

    dataWarga = dataWarga.filter(data => data !== deletedData);
    filteredWarga = filteredWarga.filter(data => data !== deletedData);

    saveData();
    isDataSaved = false;
    displayEditData();
}

btnSimpan.addEventListener('click', function () {
    let totalTabunganValue = inputTotalTabungan.textContent.replace(/[^0-9]/g, '');
    let totalTabunganNumber = parseInt(totalTabunganValue, 10);

    const DataIndex = savedData.findIndex((data) => data.tanggal === editTanggal);
    savedData[DataIndex].totalTabungan = totalTabunganNumber;

    saveTabungan();
    alert('Total Tabungan berhasil disimpan!');
    isDataSaved = true;

    // Hapus event popstate agar pengguna bisa kembali setelah data disimpan
    window.onpopstate = null;

    window.location.href = '../index.html';
});

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

// Mencegah pengguna kembali ke halaman sebelumnya jika data belum disimpan
window.addEventListener('popstate', function (event) {
    if (!isDataSaved) {
        alert('Data belum disimpan! Harap simpan data terlebih dahulu.');
        history.pushState(null, '', location.href);
    }
});

// Paksa pengguna tetap di halaman saat pertama kali dibuka
function lockBackButton() {
    history.pushState(null, '', location.href);
    history.pushState(null, '', location.href);
}

lockBackButton();

// Mencegah navigasi keluar sebelum data disimpan
navHome.addEventListener('click', (event) => {
    if (!isDataSaved) {
        alert('Data belum disimpan! Harap simpan data terlebih dahulu.');
        event.preventDefault();
    }
});

form.addEventListener('submit', addData);
displayEditData();
