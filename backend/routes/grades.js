const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getStudentGrades,
  getCourseGrades,
  updateGrade,
  getStudentCoursePerformance,
  getGradeStats
} = require('../controllers/gradeController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const updateGradeValidation = [
  body('marks')
    .notEmpty()
    .withMessage('Marks are required')
    .isFloat({ min: 0 })
    .withMessage('Marks must be a positive number'),
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),
  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters')
];

// Protected routes
router.use(protect);

// Get grade statistics for dashboard
router.get('/dashboard/stats', getGradeStats);

// Student routes
// Get student's grades
router.get('/student/my-grades', authorize('student'), getStudentGrades);

// Teacher routes
// Get course grades
router.get('/course/:courseId', authorize('teacher'), getCourseGrades);

// Get student performance in course
router.get('/student/:studentId/course/:courseId', authorize('teacher'), getStudentCoursePerformance);

// Update grade
router.put('/:id', authorize('teacher'), updateGradeValidation, updateGrade);

module.exports = router;
