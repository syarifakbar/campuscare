const { readDatabase, writeDatabase, createId } = require('./databaseService');

function safeDate(value) {
  if (!value) return '-';
  return value;
}

function login(username, password) {
  const db = readDatabase();
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  const user = db.users.find(
    (item) => item.username.toLowerCase() === cleanUsername && item.password === cleanPassword
  );

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role
  };
}

function register({ name, username, password }) {
  const db = readDatabase();
  const cleanName = String(name || '').trim();
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  if (!cleanName || !cleanUsername || !cleanPassword) {
    throw new Error('Nama, username, dan password wajib diisi.');
  }

  const usernameTaken = db.users.some((item) => item.username.toLowerCase() === cleanUsername);
  if (usernameTaken) {
    throw new Error('Username sudah digunakan.');
  }

  const newUser = {
    id: createId('u'),
    name: cleanName,
    username: cleanUsername,
    password: cleanPassword,
    role: 'mahasiswa',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDatabase(db);

  return {
    id: newUser.id,
    name: newUser.name,
    username: newUser.username,
    role: newUser.role
  };
}

function getUsers({ role = '' } = {}) {
  const db = readDatabase();
  const cleanRole = String(role || '').trim().toLowerCase();

  return db.users
    .filter((user) => !cleanRole || user.role === cleanRole)
    .map((user) => {
      const userReports = db.reports.filter((report) => report.userId === user.id);
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        createdAt: safeDate(user.createdAt),
        totalReports: userReports.length,
        reportsMasuk: userReports.filter((report) => report.status === 'Masuk').length,
        reportsDiproses: userReports.filter((report) => report.status === 'Diproses').length,
        reportsSelesai: userReports.filter((report) => report.status === 'Selesai').length,
        reportsDitolak: userReports.filter((report) => report.status === 'Ditolak').length
      };
    });
}

function getUserStats() {
  const db = readDatabase();
  const totalUsers = db.users.length;
  const totalMahasiswa = db.users.filter((user) => user.role === 'mahasiswa').length;
  const totalAdmin = db.users.filter((user) => user.role === 'admin').length;

  return {
    totalUsers,
    totalMahasiswa,
    totalAdmin
  };
}

module.exports = {
  login,
  register,
  getUsers,
  getUserStats
};
