const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

const defaultDatabase = {
  users: [
    {
      id: 'u-admin-001',
      name: 'Admin KampusCare',
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    },
    {
      id: 'u-mhs-001',
      name: 'Mahasiswa Demo',
      username: 'mhs',
      password: 'mhs123',
      role: 'mahasiswa'
    }
  ],
  categories: [
    { id: 'cat-001', name: 'AC / Pendingin Ruangan' },
    { id: 'cat-002', name: 'WiFi / Internet' },
    { id: 'cat-003', name: 'Proyektor' },
    { id: 'cat-004', name: 'Lampu' },
    { id: 'cat-005', name: 'Meja / Kursi' },
    { id: 'cat-006', name: 'Toilet' },
    { id: 'cat-007', name: 'Kebersihan Ruangan' }
  ],
  reports: [
    {
      id: 'rep-001',
      userId: 'u-mhs-001',
      reporterName: 'Mahasiswa Demo',
      title: 'WiFi Lemot di Lab Komputer',
      category: 'WiFi / Internet',
      location: 'Lab Komputer 1',
      description: 'Koneksi WiFi sering putus saat dipakai praktikum.',
      status: 'Diproses',
      adminNote: 'Sedang dicek oleh teknisi jaringan.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rep-002',
      userId: 'u-mhs-001',
      reporterName: 'Mahasiswa Demo',
      title: 'Lampu Kelas Mati',
      category: 'Lampu',
      location: 'Ruang A-203',
      description: 'Dua lampu bagian depan kelas mati.',
      status: 'Masuk',
      adminNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif-001',
      userId: 'u-mhs-001',
      message: 'Laporan WiFi Lemot di Lab Komputer sedang diproses.',
      createdAt: new Date().toISOString()
    }
  ]
};

function initializeDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDatabase, null, 2));
  }
}

function readDatabase() {
  initializeDatabase();
  const rawData = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(rawData);
}

function writeDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

module.exports = {
  initializeDatabase,
  readDatabase,
  writeDatabase,
  createId
};
