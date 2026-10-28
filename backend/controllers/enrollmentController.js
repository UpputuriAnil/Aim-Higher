const localDB = require('../utils/localDB');

// @desc    Get all enrollments for a course (Teacher only)
// @route   GET /api/enrollments/course/:courseId
// @access  Private (Teacher only)
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = localDB.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (String(course.teacherId) !== String(req.user._id) && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view enrollments for this course'
      });
    }

    const { page = 1, limit = 50, status = 'all' } = req.query;

    const query = { courseId, isActive: true };
    if (status !== 'all') query.status = status;

    const enrollments = await localDB.findEnrollments(query)
      .populate('studentId', 'name email profileImage')
      .populate('courseId', 'title description')
      .sort({ enrolledAt: -1 });

    const total = enrollments.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = enrollments.slice(startIndex, startIndex + parseInt(limit));

    // Stats
    const totalStudents = enrollments.length;
    const activeStudents = enrollments.filter(e => e.status === 'active').length;
    const avgProgress = totalStudents > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalStudents)
      : 0;

    res.json({
      success: true,
      enrollments: paginated,
      statistics: {
        totalEnrollments: totalStudents,
        activeEnrollments: activeStudents,
        averageProgress: avgProgress
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get course enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollments'
    });
  }
};

// @desc    Get student's enrollments
// @route   GET /api/enrollments/student/my-enrollments
// @access  Private (Student only)
const getStudentEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const enrollments = await localDB.findEnrollments({
      studentId: req.user._id,
      isActive: true
    }).populate('courseId', 'title description thumbnail duration category difficulty')
      .sort({ enrolledAt: -1 });

    const total = enrollments.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = enrollments.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      enrollments: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollments'
    });
  }
};

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private (Student only)
const updateEnrollmentProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const newProgress = Math.min(100, Math.max(0, parseInt(progress) || 0));

    const enrollment = localDB.updateEnrollment(req.params.id, {
      progress: newProgress,
      status: newProgress >= 100 ? 'completed' : 'active'
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Also update progress in course.enrolledStudents
    const course = localDB.getCourseById(enrollment.courseId);
    if (course) {
      course.updateProgress(enrollment.studentId, newProgress);
      await course.save();
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      enrollment
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating progress'
    });
  }
};

// @desc    Drop course
// @route   DELETE /api/enrollments/:id
// @access  Private (Student only)
const dropCourse = async (req, res) => {
  try {
    const enrollment = localDB.updateEnrollment(req.params.id, {
      status: 'dropped',
      isActive: false
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Course dropped successfully'
    });

  } catch (error) {
    console.error('Drop course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error dropping course'
    });
  }
};

// @desc    Rate course
// @route   POST /api/enrollments/:id/rate
// @access  Private (Student only)
const rateCourse = async (req, res) => {
  try {
    const { score, review = '' } = req.body;
    const ratingScore = Math.min(5, Math.max(1, parseInt(score) || 5));

    const enrollment = localDB.updateEnrollment(req.params.id, {
      rating: {
        score: ratingScore,
        review,
        ratedAt: new Date()
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Course rated successfully',
      rating: enrollment.rating
    });

  } catch (error) {
    console.error('Rate course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rating course'
    });
  }
};

// @desc    Get enrollment statistics
// @route   GET /api/enrollments/dashboard/stats
// @access  Private
const getEnrollmentStats = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const enrollments = localDB.getEnrollments().filter(
        e => String(e.studentId) === String(req.user._id) && e.isActive !== false
      );
      const active = enrollments.filter(e => e.status === 'active').length;
      const completed = enrollments.filter(e => e.status === 'completed').length;
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
        : 0;

      return res.json({
        success: true,
        stats: {
          totalEnrolled: enrollments.length,
          activeCourses: active,
          completedCourses: completed,
          averageProgress: avgProgress
        }
      });
    } else {
      // Teacher statistics
      const teacherCourses = localDB.getCourses().filter(c => String(c.teacherId) === String(req.user._id));
      const courseIds = teacherCourses.map(c => String(c._id));
      const enrollments = localDB.getEnrollments().filter(e => courseIds.includes(String(e.courseId)));

      return res.json({
        success: true,
        stats: {
          totalCourses: teacherCourses.length,
          totalStudents: enrollments.length,
          activeEnrollments: enrollments.filter(e => e.status === 'active').length
        }
      });
    }
  } catch (error) {
    console.error('Enrollment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
};

module.exports = {
  getCourseEnrollments,
  getStudentEnrollments,
  updateEnrollmentProgress,
  dropCourse,
  rateCourse,
  getEnrollmentStats
};
