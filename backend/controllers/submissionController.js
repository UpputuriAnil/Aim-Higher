const { validationResult } = require('express-validator');
const localDB = require('../utils/localDB');

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Private (Student only)
const submitAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { assignmentId, textContent = '' } = req.body;

    const assignment = localDB.getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          size: file.size,
          uploadedAt: new Date()
        });
      });
    }

    // Check if submission already exists for this student & assignment
    const existing = localDB.findSubmission({
      assignmentId,
      studentId: req.user._id
    });

    let submission;
    if (existing) {
      submission = localDB.updateSubmission(existing._id, {
        textContent,
        attachments: attachments.length > 0 ? attachments : existing.attachments,
        submittedAt: new Date(),
        status: 'submitted',
        resubmitted: true,
        resubmittedAt: new Date()
      });
    } else {
      submission = localDB.createSubmission({
        assignmentId,
        studentId: req.user._id,
        textContent,
        attachments,
        isLate: new Date() > new Date(assignment.dueDate)
      });
    }

    await submission.populate('assignmentId', 'title dueDate maxMarks');
    await submission.populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission
    });

  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting assignment'
    });
  }
};

// @desc    Get submissions for an assignment (Teacher only)
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Teacher only)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { page = 1, limit = 20, status = 'all' } = req.query;

    let submissions = localDB.getSubmissions();

    // If assignmentId is 'all', show all submissions for assignments belonging to this teacher
    if (assignmentId === 'all') {
      const teacherAssignments = localDB.getAssignments().filter(
        a => String(a.teacherId) === String(req.user._id)
      );
      const assignmentIds = teacherAssignments.map(a => String(a._id));
      submissions = submissions.filter(s => assignmentIds.includes(String(s.assignmentId)));
    } else {
      submissions = submissions.filter(s => String(s.assignmentId) === String(assignmentId));
    }

    if (status !== 'all') {
      submissions = submissions.filter(s => s.status === status);
    }

    // Populate assignment and student details
    const populated = await new (require('../utils/localDB')).constructor()
      .findSubmissions({})
      .populate('assignmentId', 'title dueDate maxMarks')
      .populate('studentId', 'name email profileImage');

    const populatedIds = submissions.map(s => String(s._id));
    const result = populated.filter(p => populatedIds.includes(String(p._id)));

    const total = result.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = result.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      submissions: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submissions'
    });
  }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
  try {
    const raw = localDB.getSubmissionById(req.params.id);
    if (!raw) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = localDB.wrapModel(raw);
    await submission.populate('assignmentId', 'title dueDate maxMarks');
    await submission.populate('studentId', 'name email profileImage');

    res.json({
      success: true,
      submission
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submission'
    });
  }
};

// @desc    Grade submission (Teacher only)
// @route   POST /api/submissions/:id/grade
// @access  Private (Teacher only)
const gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const submission = localDB.getSubmissionById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const assignment = localDB.getAssignmentById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const { marks, feedback = '', remarks = '' } = req.body;
    const maxMarks = assignment.maxMarks || 100;

    // Create Grade record and update submission
    const grade = localDB.createGrade({
      studentId: submission.studentId,
      courseId: assignment.courseId,
      assignmentId: assignment._id,
      submissionId: submission._id,
      teacherId: req.user._id,
      marks: parseFloat(marks),
      maxMarks: parseFloat(maxMarks),
      feedback,
      remarks
    });

    const updatedSubmission = localDB.getSubmissionById(submission._id);
    const wrapped = localDB.wrapModel(updatedSubmission);
    await wrapped.populate('assignmentId', 'title dueDate maxMarks');
    await wrapped.populate('studentId', 'name email');

    res.json({
      success: true,
      message: 'Submission graded successfully',
      submission: wrapped,
      grade
    });

  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error grading submission'
    });
  }
};

// @desc    Get student's submissions
// @route   GET /api/submissions/student/my-submissions
// @access  Private (Student only)
const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await localDB.findSubmissions({
      studentId: req.user._id
    }).populate('assignmentId', 'title dueDate maxMarks')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      submissions
    });

  } catch (error) {
    console.error('Get student submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student submissions'
    });
  }
};

// @desc    Update submission (resubmit)
// @route   PUT /api/submissions/:id
// @access  Private (Student only)
const updateSubmission = async (req, res) => {
  try {
    const submission = localDB.getSubmissionById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (String(submission.studentId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this submission'
      });
    }

    const { textContent } = req.body;
    const attachments = submission.attachments || [];

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          size: file.size,
          uploadedAt: new Date()
        });
      });
    }

    const updated = localDB.updateSubmission(req.params.id, {
      textContent: textContent !== undefined ? textContent : submission.textContent,
      attachments,
      resubmitted: true,
      resubmittedAt: new Date()
    });

    await updated.populate('assignmentId', 'title');

    res.json({
      success: true,
      message: 'Submission updated successfully',
      submission: updated
    });

  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating submission'
    });
  }
};

module.exports = {
  submitAssignment,
  getAssignmentSubmissions,
  getSubmissionById,
  gradeSubmission,
  getStudentSubmissions,
  updateSubmission
};
