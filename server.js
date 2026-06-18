require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { initializeDatabase } = require('./services/databaseService');

const app = express();
const PORT = process.env.PORT || 3000;

initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/admin', express.static(path.join(__dirname, 'client-admin')));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);

// Client Mahasiswa dijadikan halaman utama/index.
// Jadi saat deploy cukup buka domain utama: https://namaproject.onrender.com/
app.get('/mahasiswa', (req, res) => {
  res.redirect('/');
});

app.use('/', express.static(path.join(__dirname, 'client-mahasiswa')));

app.listen(PORT, () => {
  console.log(`KampusCare server running on http://localhost:${PORT}`);
  console.log(`Client Mahasiswa: http://localhost:${PORT}`);
  console.log(`Client Admin    : http://localhost:${PORT}/admin`);
});
