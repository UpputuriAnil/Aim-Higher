const express = require('express');
const router = express.Router();
const localDB = require('../utils/localDB');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const notifications = localDB.getNotifications(req.user._id);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ success: false, message: 'Server error loading notifications' });
  }
});

// Mark single as read
router.put('/:id/read', async (req, res) => {
  try {
    const updated = localDB.markNotificationAsRead(req.params.id, req.user._id);
    res.json({ success: true, notification: updated });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    localDB.markAllNotificationsAsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
});

module.exports = router;
