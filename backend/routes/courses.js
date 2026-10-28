const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getTeacherCourses,
  enrollInCourse,
  getStudentEnrolledCourses
} = require('../controllers/courseController');
const { getCourseEnrollments } = require('../controllers/enrollmentController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const createCourseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Course duration is required'),
  body('category')
    .optional()
    .trim(),
  body('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid difficulty level')
];

const updateCourseValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
];

// Public routes
// 1. Get all courses
router.get('/', getAllCourses);

// 2. Specific protected endpoints MUST COME BEFORE /:id
router.get('/student/enrolled', protect, authorize('student'), getStudentEnrolledCourses);
router.get('/teacher/my-courses', protect, authorize('teacher'), getTeacherCourses);

// 3. Get course by ID (public or authenticated)
router.get('/:id', getCourseById);

// Protected routes
router.use(protect);

// Student routes
router.post('/:id/enroll', authorize('student'), enrollInCourse);

// Teacher routes
router.post('/', authorize('teacher'), createCourseValidation, createCourse);
router.get('/:id/students', authorize('teacher'), (req, res, next) => {
  req.params.courseId = req.params.id;
  getCourseEnrollments(req, res, next);
});
router.put('/:id', authorize('teacher'), updateCourseValidation, updateCourse);
router.delete('/:id', authorize('teacher'), deleteCourse);

module.exports = router;
