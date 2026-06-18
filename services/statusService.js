const validStatuses = ['Masuk', 'Diproses', 'Selesai', 'Ditolak'];

function validateStatus(status) {
  return validStatuses.includes(status);
}

function getValidStatuses() {
  return validStatuses;
}

module.exports = {
  validateStatus,
  getValidStatuses
};
