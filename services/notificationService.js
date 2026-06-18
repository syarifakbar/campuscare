const { readDatabase, writeDatabase, createId } = require('./databaseService');

function createNotification(userId, message) {
  const db = readDatabase();
  const notification = {
    id: createId('notif'),
    userId,
    message,
    createdAt: new Date().toISOString()
  };

  db.notifications.push(notification);
  writeDatabase(db);
  return notification;
}

function getNotificationsByUser(userId) {
  const db = readDatabase();
  return db.notifications
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  createNotification,
  getNotificationsByUser
};
