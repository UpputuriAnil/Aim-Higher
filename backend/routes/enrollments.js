const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getCourseEnrollments,
  getStudentEnrollments,
  updateEnrollmentProgress,
  dropCourse,
  rateCourse,
  getEnrollmentStats
} = require('../controllers/enrollmentController');
const { enrollInCourse } = require('../controllers/courseController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const updateProgressValidation = [
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('materialId')
    .optional()
    .isString()
    .withMessage('Material ID must be a string'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive integer')
];

const rateCourseValidation = [
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating score must be between 1 and 5'),
  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
];

const dropCourseValidation = [
  body('reason')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Reason cannot exceed 1000 characters')
];

// Protected routes
router.use(protect);

// Get enrollment statistics for dashboard
router.get('/dashboard/stats', getEnrollmentStats);

// Student routes
// Get student's enrollments (supports both /my-courses and /student/my-enrollments)
router.get(['/student/my-enrollments', '/my-courses'], authorize('student'), getStudentEnrollments);

// Enroll in course
router.post(['/enroll/:courseId', '/:courseId'], authorize('student'), (req, res, next) => {
  req.params.id = req.params.courseId;
  enrollInCourse(req, res, next);
});

// Update enrollment progress
router.put('/:id/progress', authorize('student'), updateProgressValidation, updateEnrollmentProgress);

// Rate course
router.post('/:id/rate', authorize('student'), rateCourseValidation, rateCourse);

// Drop course
router.delete('/:id', authorize('student'), dropCourseValidation, dropCourse);

// Teacher routes
// Get course enrollments (supports both /course/:courseId and /:courseId/students)
router.get(['/course/:courseId', '/:courseId/students'], authorize('teacher'), getCourseEnrollments);

module.exports = router;
