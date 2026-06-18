const { readDatabase, writeDatabase, createId } = require('./databaseService');
const { validateStatus } = require('./statusService');
const { createNotification } = require('./notificationService');

function getReports({ role, userId }) {
  const db = readDatabase();
  const reports = role === 'admin'
    ? db.reports
    : db.reports.filter((item) => item.userId === userId);

  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getReportById(id) {
  const db = readDatabase();
  return db.reports.find((item) => item.id === id) || null;
}

function createReport(payload) {
  const db = readDatabase();
  const { userId, reporterName, title, category, location, description } = payload;

  if (!userId || !reporterName || !title || !category || !location || !description) {
    throw new Error('Semua field laporan wajib diisi.');
  }

  const now = new Date().toISOString();
  const report = {
    id: createId('rep'),
    userId,
    reporterName,
    title: String(title).trim(),
    category: String(category).trim(),
    location: String(location).trim(),
    description: String(description).trim(),
    status: 'Masuk',
    adminNote: '',
    createdAt: now,
    updatedAt: now
  };

  db.reports.push(report);
  writeDatabase(db);

  createNotification(userId, `Laporan "${report.title}" berhasil dikirim dan menunggu diproses.`);

  return report;
}

function updateReportStatus(id, status, adminNote) {
  const db = readDatabase();

  if (!validateStatus(status)) {
    throw new Error('Status laporan tidak valid.');
  }

  const reportIndex = db.reports.findIndex((item) => item.id === id);
  if (reportIndex === -1) {
    throw new Error('Laporan tidak ditemukan.');
  }

  db.reports[reportIndex].status = status;
  db.reports[reportIndex].adminNote = String(adminNote || '').trim();
  db.reports[reportIndex].updatedAt = new Date().toISOString();

  const updatedReport = db.reports[reportIndex];
  writeDatabase(db);

  createNotification(
    updatedReport.userId,
    `Status laporan "${updatedReport.title}" berubah menjadi ${status}.`
  );

  return updatedReport;
}

function deleteReport(id) {
  const db = readDatabase();
  const beforeLength = db.reports.length;
  db.reports = db.reports.filter((item) => item.id !== id);
  writeDatabase(db);
  return beforeLength !== db.reports.length;
}

function getReportStats() {
  const db = readDatabase();
  const total = db.reports.length;
  const masuk = db.reports.filter((item) => item.status === 'Masuk').length;
  const diproses = db.reports.filter((item) => item.status === 'Diproses').length;
  const selesai = db.reports.filter((item) => item.status === 'Selesai').length;
  const ditolak = db.reports.filter((item) => item.status === 'Ditolak').length;

  return {
    total,
    masuk,
    diproses,
    selesai,
    ditolak
  };
}

module.exports = {
  getReports,
  getReportById,
  createReport,
  updateReportStatus,
  deleteReport,
  getReportStats
};
