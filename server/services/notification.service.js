/**
 * notification.service.js
 * In-app notification creation and management (stored in notifications.json).
 */
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('./db');

function createNotification(userId, type, message, complaintId = null) {
  const notifications = readData('notifications');
  const n = {
    id: uuidv4(),
    userId,
    type,       // 'info' | 'warning' | 'success' | 'error'
    message,
    complaintId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(n);
  writeData('notifications', notifications);
  return n;
}

function getForUser(userId) {
  return readData('notifications')
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function markRead(notificationId) {
  const notifications = readData('notifications');
  const idx = notifications.findIndex((n) => n.id === notificationId);
  if (idx !== -1) {
    notifications[idx].read = true;
    writeData('notifications', notifications);
  }
}

function markAllRead(userId) {
  const notifications = readData('notifications').map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  writeData('notifications', notifications);
}

module.exports = { createNotification, getForUser, markRead, markAllRead };
