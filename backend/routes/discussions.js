const express = require('express');
const router = express.Router();
const localDB = require('../utils/localDB');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get discussions for course
router.get('/course/:courseId', async (req, res) => {
  try {
    const discussions = localDB.getDiscussions(req.params.courseId);
    res.json({ success: true, discussions });
  } catch (err) {
    console.error('Discussions error:', err);
    res.status(500).json({ success: false, message: 'Server error loading discussions' });
  }
});

// Create discussion post
router.post('/', async (req, res) => {
  try {
    const { courseId, title, content } = req.body;
    if (!courseId || !title || !content) {
      return res.status(400).json({ success: false, message: 'Course ID, title and content are required' });
    }

    const post = localDB.createDiscussion({
      courseId,
      title,
      content,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.profileImage || req.user.avatar || ''
    });

    res.status(201).json({ success: true, message: 'Discussion posted successfully', post });
  } catch (err) {
    console.error('Create discussion error:', err);
    res.status(500).json({ success: false, message: 'Server error creating discussion' });
  }
});

// Add reply
router.post('/:id/replies', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const reply = localDB.addReplyToDiscussion(req.params.id, {
      content,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.profileImage || req.user.avatar || ''
    });

    if (!reply) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found' });
    }

    res.status(201).json({ success: true, message: 'Reply added successfully', reply });
  } catch (err) {
    console.error('Add reply error:', err);
    res.status(500).json({ success: false, message: 'Server error adding reply' });
  }
});

module.exports = router;
