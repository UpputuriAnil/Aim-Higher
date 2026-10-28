const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getTeacherAssignments,
  getStudentAssignments
} = require('../controllers/assignmentController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const createAssignmentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Assignment title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Assignment description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
];

const updateAssignmentValidation = [
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

// Protected routes
router.use(protect);

// Specific routes MUST come before parameterized /:id
router.get('/teacher/my-assignments', authorize('teacher'), getTeacherAssignments);
router.get('/student/my-assignments', authorize('student'), getStudentAssignments);
router.get('/course/:courseId', getCourseAssignments);

// Get assignment by ID
router.get('/:id', getAssignmentById);

// Teacher CRUD
router.post('/', authorize('teacher'), createAssignmentValidation, createAssignment);
router.put('/:id', authorize('teacher'), updateAssignmentValidation, updateAssignment);
router.delete('/:id', authorize('teacher'), deleteAssignment);

module.exports = router;
