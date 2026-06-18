const fs = require('fs');
const path = require('path');
const os = require('os');

const seedDbPath = path.join(__dirname, '..', 'data', 'db.json');

// Di Vercel, folder project bersifat read-only.
// Jadi untuk kebutuhan demo online, database runtime disimpan di /tmp.
// Kalau lokal, tetap pakai data/db.json.
const runtimeDbPath = process.env.VERCEL
  ? path.join(os.tmpdir(), 'kampuscare-db.json')
  : seedDbPath;

const defaultDatabase = {
  users: [
    {
      id: 1,
      name: 'Admin Kampus',
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    },
    {
      id: 2,
      name: 'Mahasiswa Demo',
      username: 'mhs',
      password: 'mhs123',
      role: 'mahasiswa'
    }
  ],
  categories: [
    { id: 1, name: 'AC' },
    { id: 2, name: 'WiFi' },
    { id: 3, name: 'Proyektor' },
    { id: 4, name: 'Lampu' },
    { id: 5, name: 'Toilet' },
    { id: 6, name: 'Kursi / Meja' }
  ],
  reports: [],
  notifications: []
};

function normalizeDatabase(db) {
  return {
    users: Array.isArray(db.users) ? db.users : defaultDatabase.users,
    categories: Array.isArray(db.categories) ? db.categories : defaultDatabase.categories,
    reports: Array.isArray(db.reports) ? db.reports : [],
    notifications: Array.isArray(db.notifications) ? db.notifications : []
  };
}

function ensureDatabaseFile() {
  try {
    if (fs.existsSync(runtimeDbPath)) {
      return;
    }

    if (fs.existsSync(seedDbPath)) {
      const seedData = fs.readFileSync(seedDbPath, 'utf-8');
      fs.writeFileSync(runtimeDbPath, seedData);
      return;
    }

    fs.writeFileSync(runtimeDbPath, JSON.stringify(defaultDatabase, null, 2));
  } catch (error) {
    console.error('Gagal membuat database runtime:', error.message);
  }
}

function initializeDatabase() {
  ensureDatabaseFile();
}

function readDatabase() {
  ensureDatabaseFile();

  try {
    const rawData = fs.readFileSync(runtimeDbPath, 'utf-8');
    const parsedData = JSON.parse(rawData);
    return normalizeDatabase(parsedData);
  } catch (error) {
    console.error('Gagal membaca database:', error.message);
    return defaultDatabase;
  }
}

function writeDatabase(data) {
  ensureDatabaseFile();

  try {
    const normalizedData = normalizeDatabase(data);
    fs.writeFileSync(runtimeDbPath, JSON.stringify(normalizedData, null, 2));
    return normalizedData;
  } catch (error) {
    console.error('Gagal menulis database:', error.message);
    throw new Error(error.message);
  }
}

// Fungsi ini dipakai service lain untuk bikin ID baru.
// Contoh: users, reports, categories, notifications.
function createId(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 1;
  }

  const maxId = items.reduce((max, item) => {
    const currentId = Number(item.id) || 0;
    return currentId > max ? currentId : max;
  }, 0);

  return maxId + 1;
}

module.exports = {
  initializeDatabase,
  readDatabase,
  writeDatabase,
  createId
};