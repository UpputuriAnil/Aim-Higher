const { validationResult } = require('express-validator');
const localDB = require('../utils/localDB');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher only)
const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      courseId,
      dueDate,
      maxMarks = 100,
      instructions = '',
      submissionType = 'both',
      allowLateSubmission = true,
      latePenalty = 0
    } = req.body;

    const course = localDB.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (String(course.teacherId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create assignment for this course'
      });
    }

    const assignment = localDB.createAssignment({
      title,
      description,
      courseId,
      teacherId: req.user._id,
      dueDate: new Date(dueDate),
      maxMarks: parseInt(maxMarks) || 100,
      instructions,
      submissionType,
      allowLateSubmission: Boolean(allowLateSubmission),
      latePenalty: parseInt(latePenalty) || 0,
      isPublished: true
    });

    await assignment.populate('courseId', 'title');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating assignment'
    });
  }
};

// @desc    Get all assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = localDB.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const query = { courseId, isActive: true };
    if (req.user.role === 'student') {
      query.isPublished = true;
    }

    const assignments = await localDB.findAssignments(query)
      .populate('teacherId', 'name email')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      assignments
    });

  } catch (error) {
    console.error('Get course assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignments'
    });
  }
};

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
  try {
    const rawAssignment = localDB.getAssignmentById(req.params.id);
    if (!rawAssignment || rawAssignment.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const assignment = localDB.wrapModel(rawAssignment);
    await assignment.populate('courseId', 'title');
    await assignment.populate('teacherId', 'name email');

    res.json({
      success: true,
      assignment
    });

  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignment'
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher only)
const updateAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const assignment = localDB.getAssignmentById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (String(assignment.teacherId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment'
      });
    }

    const updates = { ...req.body };
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
    if (updates.maxMarks) updates.maxMarks = parseInt(updates.maxMarks);

    const updated = localDB.updateAssignment(req.params.id, updates);
    await updated.populate('courseId', 'title');

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: updated
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating assignment'
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher only)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = localDB.getAssignmentById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (String(assignment.teacherId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment'
      });
    }

    localDB.deleteAssignment(req.params.id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting assignment'
    });
  }
};

// @desc    Get teacher's assignments
// @route   GET /api/assignments/teacher/my-assignments
// @access  Private (Teacher only)
const getTeacherAssignments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      courseId,
      status = 'all'
    } = req.query;

    const query = { teacherId: req.user._id, isActive: true };
    if (courseId) query.courseId = courseId;
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;

    const assignments = await localDB.findAssignments(query)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    const total = assignments.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = assignments.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      assignments: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching teacher assignments'
    });
  }
};

// @desc    Get student's assignments
// @route   GET /api/assignments/student/my-assignments
// @access  Private (Student only)
const getStudentAssignments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      courseId,
      status = 'all'
    } = req.query;

    // Get active enrollments for this student
    const enrollments = localDB.getEnrollments().filter(
      e => String(e.studentId) === String(req.user._id) && e.status === 'active'
    );
    const enrolledCourseIds = enrollments.map(e => String(e.courseId));

    const allAssignments = localDB.getAssignments().filter(
      a => a.isActive !== false && a.isPublished !== false && (enrolledCourseIds.includes(String(a.courseId)) || enrolledCourseIds.length === 0)
    );

    const submissions = localDB.getSubmissions().filter(
      s => String(s.studentId) === String(req.user._id)
    );

    const submissionsMap = {};
    submissions.forEach(s => {
      submissionsMap[String(s.assignmentId)] = s;
    });

    let formattedAssignments = allAssignments.map(a => {
      const assignmentModel = localDB.wrapModel(a);
      const sub = submissionsMap[String(a._id)];
      const course = localDB.getCourseById(a.courseId);

      const item = {
        _id: a._id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        maxMarks: a.maxMarks,
        instructions: a.instructions,
        submissionType: a.submissionType,
        assignmentId: {
          _id: a._id,
          title: a.title,
          courseId: course ? { _id: course._id, title: course.title } : a.courseId
        },
        courseId: course ? { _id: course._id, title: course.title } : a.courseId,
        submissionStatus: sub ? {
          submitted: true,
          submittedAt: sub.submittedAt,
          isLate: sub.isLate,
          status: sub.status,
          grade: sub.grade,
          feedback: sub.feedback
        } : {
          submitted: false,
          isOverdue: new Date() > new Date(a.dueDate)
        }
      };
      return item;
    });

    if (courseId) {
      formattedAssignments = formattedAssignments.filter(
        a => String(a.courseId?._id || a.courseId) === String(courseId)
      );
    }

    if (status === 'submitted') {
      formattedAssignments = formattedAssignments.filter(a => a.submissionStatus.submitted);
    } else if (status === 'pending') {
      formattedAssignments = formattedAssignments.filter(a => !a.submissionStatus.submitted && !a.submissionStatus.isOverdue);
    } else if (status === 'overdue') {
      formattedAssignments = formattedAssignments.filter(a => !a.submissionStatus.submitted && a.submissionStatus.isOverdue);
    }

    const total = formattedAssignments.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = formattedAssignments.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      assignments: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student assignments'
    });
  }
};

module.exports = {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getTeacherAssignments,
  getStudentAssignments
};
