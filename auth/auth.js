// Mengambil data user dari localStorage atau membuat array kosong jika belum ada
let users = JSON.parse(localStorage.getItem('users')) || [];

// Fungsi untuk menyimpan data ke localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveLoggedInUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
}

// Fungsi untuk registrasi user baru
function registerUser(event) {
    event.preventDefault(); // Mencegah halaman refresh saat submit

    const usernameRegis = document.getElementById('usernameRegis').value.trim();
    const passwordRegis = document.getElementById('passwordRegis').value.trim();

    if (usernameRegis === '' || passwordRegis === '') {
        alert('Username dan Password tidak boleh kosong!');
        return;
    }

    // Cek apakah username sudah digunakan
    if (users.find(user => user.username === usernameRegis)) {
        alert('Username sudah terdaftar, silahkan login!');
        return;
    }

    // Tambah user baru ke dalam array
    const newUser = { username: usernameRegis, password: passwordRegis };
    users.push(newUser);
    saveUsers();

    alert('Registrasi berhasil, silahkan login!');
    document.getElementById('usernameRegis').value = '';
    document.getElementById('passwordRegis').value = '';

    // Redirect ke halaman home
    window.location.href = 'login.html';
}


// Fungsi untuk login
function loginUser(event) {
    event.preventDefault();
    const usernameLogin = document.getElementById("usernameLogin").value.trim();
    const passwordLogin = document.getElementById("passwordLogin").value.trim();

    if (usernameLogin === "" || passwordLogin === "") {
        alert("Username dan Password tidak boleh kosong!");
        return;
    }

    const user = users.find(user => user.username === usernameLogin && user.password === passwordLogin);
    if (!user) {
        alert("Username atau Password salah!");
        return;
    }

    saveLoggedInUser(user);
    alert("Login berhasil!");
    window.location.href = "/home/home.html";
}

// Cek apakah halaman saat ini adalah register atau login
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('formRegis')) {
        document.getElementById('formRegis').addEventListener('submit', registerUser);
    }

    if (document.getElementById('formLogin')) {
        document.getElementById('formLogin').addEventListener('submit', loginUser);
    }
});
