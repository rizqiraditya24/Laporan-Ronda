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

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Ambil user yang login

let savedData = JSON.parse(localStorage.getItem('savedTabunganData')) || [];
function saveTabungan() {
    localStorage.setItem('savedTabunganData', JSON.stringify(savedData));
}

let dataWarga = JSON.parse(localStorage.getItem('warga')) || [];
function saveData() {
    localStorage.setItem('warga', JSON.stringify(dataWarga));
}

// Filter berdasarkan tanggal dan username yang login
let filteredWarga = dataWarga.filter((data) =>
    data.tanggal === editTanggal && data.username === loggedInUser.username
);

// Validasi input hanya angka
inputTabungan.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
    let value = this.value;
    let formattedValue = formatRupiah(value, 'Rp ');
    this.value = formattedValue;
});

// Prevent spasi
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

    let isDuplicate = filteredWarga.some((data, index) =>
        data.namaWarga.toLowerCase() === namaWarga.toLowerCase() && index !== editIndex
    );

    if (isDuplicate) {
        alert('Nama warga sudah ada dalam daftar! Harap masukkan nama yang berbeda.');
        return;
    }

    if (editIndex === null) {
        let newData = {
            namaWarga: namaWarga,
            tabungan: tabungan,
            tanggal: editTanggal,
            username: loggedInUser.username,
        };
        dataWarga.push(newData);
    } else {
        dataWarga[editIndex] = {
            namaWarga: namaWarga,
            tabungan: tabungan,
            tanggal: editTanggal,
            username: loggedInUser.username,
        };
        editIndex = null;
    }

    // Filter ulang setelah perubahan
    filteredWarga = dataWarga.filter((data) =>
        data.tanggal === editTanggal && data.username === loggedInUser.username
    );

    isDataSaved = false;
    saveData();
    calculateTotalTabungan(true);
    displayEditData();

    inputNamaWarga.value = '';
    inputTabungan.value = '';
}

function deleteData(index) {
    let deletedData = filteredWarga[index];

    dataWarga = dataWarga.filter(data =>
        !(data.namaWarga === deletedData.namaWarga &&
          data.tanggal === editTanggal &&
          data.username === loggedInUser.username)
    );

    filteredWarga = dataWarga.filter((data) =>
        data.tanggal === editTanggal && data.username === loggedInUser.username
    );

    saveData();
    isDataSaved = false;
    calculateTotalTabungan(true);
    displayEditData();
}

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
            <div class="btnContainer">
                <button id="editButton" onclick="editData(${filteredWarga.indexOf(data)})">Edit</button>
                <button id="deleteButton" onclick="deleteData(${filteredWarga.indexOf(data)})">Delete</button>
            </div>
            `;

        output.appendChild(listItem);
    });

    calculateTotalTabungan(true);
    btnTambah.textContent = 'Tambah';
}

function editData(index) {
    let dataToEdit = filteredWarga[index];

    inputNamaWarga.value = dataToEdit.namaWarga;
    inputTabungan.value = dataToEdit.tabungan;

    editIndex = dataWarga.findIndex(
        (data) =>
            data.namaWarga === dataToEdit.namaWarga &&
            data.tabungan === dataToEdit.tabungan &&
            data.tanggal === dataToEdit.tanggal &&
            data.username === loggedInUser.username
    );

    inputNamaWarga.focus();
    btnTambah.textContent = 'Edit';
}

btnSimpan.addEventListener('click', function () {
    document.getElementById('modalTanggal').value = editTanggal; // isi tanggal di modal
    document.getElementById('modal').style.display = 'block'; // tampilkan modal
});


search.addEventListener('input', function () {
    displayEditData(this.value.trim().toLowerCase());
});

navHome.addEventListener('click', (event) => {
    if (!isDataSaved) {
        alert('Data belum disimpan! Harap simpan data terlebih dahulu.');
        event.preventDefault();
    }
});

window.addEventListener('popstate', function (event) {
    if (!isDataSaved) {
        alert('Data belum disimpan! Harap simpan data terlebih dahulu.');
        history.pushState(null, '', location.href);
    }
});

function lockBackButton() {
    history.pushState(null, '', location.href);
    history.pushState(null, '', location.href);
}

document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none'; // Tutup modal
});

document.getElementById('saveModal').addEventListener('click', function () {
    const newTanggal = document.getElementById('modalTanggal').value;

    if (!newTanggal) {
        alert('Tanggal tidak boleh kosong!');
        return;
    }

    // Update tanggal di semua data filteredWarga
    dataWarga = dataWarga.map(data => {
        if (data.tanggal === editTanggal && data.username === loggedInUser.username) {
            return { ...data, tanggal: newTanggal };
        }
        return data;
    });

    // Update tanggal total tabungan jika ada
    const indexTotal = savedData.findIndex(data => data.tanggal === editTanggal);
    if (indexTotal !== -1) {
        savedData[indexTotal].tanggal = newTanggal;
    }

    // Simpan dan navigasi
    saveData();
    saveTabungan();

    alert('Data berhasil disimpan!');
    window.location.href = '/home/home.html';
});


lockBackButton();

form.addEventListener('submit', addData);
displayEditData();