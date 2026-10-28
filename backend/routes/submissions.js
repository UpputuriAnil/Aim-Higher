const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  submitAssignment,
  getAssignmentSubmissions,
  getSubmissionById,
  gradeSubmission,
  getStudentSubmissions,
  updateSubmission
} = require('../controllers/submissionController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

// Validation rules
const submitAssignmentValidation = [
  body('assignmentId')
    .notEmpty()
    .withMessage('Assignment ID is required'),
  body('textContent')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Text content cannot exceed 5000 characters')
];

const gradeSubmissionValidation = [
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

const updateSubmissionValidation = [
  body('textContent')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Text content cannot exceed 5000 characters')
];

// Protected routes
router.use(protect);

// Specific routes
router.get('/student/my-submissions', authorize('student'), getStudentSubmissions);
router.get('/assignment/:assignmentId', authorize('teacher'), getAssignmentSubmissions);

// Single submission by ID
router.get('/:id', getSubmissionById);

// Submit assignment (supports both / and /:assignmentId/submit)
router.post(['/', '/:assignmentId/submit'], 
  authorize('student'), 
  uploadMultiple('files', 5), 
  (req, res, next) => {
    if (req.params.assignmentId && !req.body.assignmentId) {
      req.body.assignmentId = req.params.assignmentId;
    }
    next();
  },
  submitAssignmentValidation, 
  submitAssignment
);

// Update submission (resubmit)
router.put('/:id', 
  authorize('student'), 
  uploadMultiple('files', 5), 
  updateSubmissionValidation, 
  updateSubmission
);

// Grade submission (supports both POST and PUT)
router.post('/:id/grade', authorize('teacher'), gradeSubmissionValidation, gradeSubmission);
router.put('/:id/grade', authorize('teacher'), gradeSubmissionValidation, gradeSubmission);

module.exports = router;
