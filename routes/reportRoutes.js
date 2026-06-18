const express = require('express');
const {
  getReports,
  getReportById,
  createReport,
  updateReportStatus,
  deleteReport,
  getReportStats
} = require('../services/reportService');
const { getValidStatuses } = require('../services/statusService');
const { getNotificationsByUser } = require('../services/notificationService');

const router = express.Router();

router.get('/', (req, res) => {
  const role = req.query.role || 'admin';
  const userId = req.query.userId || '';

  return res.json({
    success: true,
    reports: getReports({ role, userId })
  });
});

router.get('/stats', (req, res) => {
  return res.json({
    success: true,
    stats: getReportStats()
  });
});

router.get('/statuses', (req, res) => {
  return res.json({
    success: true,
    statuses: getValidStatuses()
  });
});

router.get('/notifications/:userId', (req, res) => {
  return res.json({
    success: true,
    notifications: getNotificationsByUser(req.params.userId)
  });
});

router.get('/:id', (req, res) => {
  const report = getReportById(req.params.id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Laporan tidak ditemukan.'
    });
  }

  return res.json({
    success: true,
    report
  });
});

router.post('/', (req, res) => {
  try {
    const report = createReport(req.body);
    return res.status(201).json({
      success: true,
      message: 'Laporan berhasil dikirim.',
      report
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id/status', (req, res) => {
  try {
    const report = updateReportStatus(req.params.id, req.body.status, req.body.adminNote);
    return res.json({
      success: true,
      message: 'Status laporan berhasil diperbarui.',
      report
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', (req, res) => {
  const deleted = deleteReport(req.params.id);

  return res.json({
    success: deleted,
    message: deleted ? 'Laporan berhasil dihapus.' : 'Laporan tidak ditemukan.'
  });
});

module.exports = router;
