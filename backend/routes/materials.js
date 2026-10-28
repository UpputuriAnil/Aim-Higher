const express = require('express');
const router = express.Router();
const localDB = require('../utils/localDB');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Get materials for course
router.get('/course/:courseId', async (req, res) => {
  try {
    const materials = localDB.getMaterials(req.params.courseId);
    res.json({ success: true, materials });
  } catch (err) {
    console.error('Materials error:', err);
    res.status(500).json({ success: false, message: 'Server error loading materials' });
  }
});

// Teacher: add course material
router.post('/', authorize('teacher'), async (req, res) => {
  try {
    const { courseId, title, format, url, description, duration } = req.body;
    if (!courseId || !title || !url) {
      return res.status(400).json({ success: false, message: 'Course ID, title and material URL are required' });
    }

    const material = localDB.createMaterial({
      courseId,
      title,
      type: 'document',
      format: format || 'PDF',
      url,
      description: description || '',
      duration: duration || '10 min',
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Material added successfully', material });
  } catch (err) {
    console.error('Add material error:', err);
    res.status(500).json({ success: false, message: 'Server error adding material' });
  }
});

// Teacher: delete material
router.delete('/:id', authorize('teacher'), async (req, res) => {
  try {
    localDB.deleteMaterial(req.params.id);
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (err) {
    console.error('Delete material error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting material' });
  }
});

module.exports = router;
