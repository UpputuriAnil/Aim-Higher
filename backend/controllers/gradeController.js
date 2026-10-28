const localDB = require('../utils/localDB');

// @desc    Get student's grades
// @route   GET /api/grades/student/my-grades
// @access  Private (Student only)
const getStudentGrades = async (req, res) => {
  try {
    const { page = 1, limit = 20, courseId } = req.query;

    const query = { studentId: req.user._id, isActive: true };
    if (courseId) query.courseId = courseId;

    const grades = await localDB.findGrades(query)
      .populate('courseId', 'title description')
      .populate('assignmentId', 'title')
      .populate('teacherId', 'name email')
      .sort({ gradedAt: -1 });

    const stats = localDB.calculateOverallStudentStats(req.user._id);

    const total = grades.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = grades.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      grades: paginated,
      statistics: {
        averagePercentage: stats.averagePercentage,
        totalGrades: stats.totalGrades,
        totalMarks: stats.totalMarks,
        totalMaxMarks: stats.totalMaxMarks,
        highestGrade: stats.highestGrade,
        lowestGrade: stats.lowestGrade,
        overallGpa: stats.overallGpa,
        overallLetterGrade: stats.overallLetterGrade
      },
      gradeDistribution: stats.gradeDistribution,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student grades'
    });
  }
};

// @desc    Get grades for a course (Teacher only)
// @route   GET /api/grades/course/:courseId
// @access  Private (Teacher only)
const getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    const grades = await localDB.findGrades({ courseId, isActive: true })
      .populate('studentId', 'name email profileImage')
      .populate('assignmentId', 'title maxMarks')
      .sort({ gradedAt: -1 });

    res.json({
      success: true,
      grades
    });
  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course grades'
    });
  }
};

// @desc    Update grade (Teacher only)
// @route   PUT /api/grades/:id
// @access  Private (Teacher only)
const updateGrade = async (req, res) => {
  try {
    const { marks, feedback, remarks } = req.body;
    const grade = localDB.updateGrade(req.params.id, {
      marks: parseFloat(marks),
      feedback,
      remarks
    });

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      message: 'Grade updated successfully',
      grade
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating grade'
    });
  }
};

// @desc    Get student performance in a course
// @route   GET /api/grades/student/:studentId/course/:courseId
// @access  Private (Teacher only)
const getStudentCoursePerformance = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const grades = await localDB.findGrades({ studentId, courseId, isActive: true })
      .populate('assignmentId', 'title maxMarks');

    res.json({
      success: true,
      grades
    });
  } catch (error) {
    console.error('Student performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching performance'
    });
  }
};

// @desc    Get grade statistics for dashboard
// @route   GET /api/grades/dashboard/stats
// @access  Private
const getGradeStats = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const stats = localDB.calculateOverallStudentStats(req.user._id);
      return res.json({ success: true, statistics: stats });
    } else {
      // Teacher stats across all teacher's courses
      const teacherCourses = localDB.getCourses().filter(c => String(c.teacherId) === String(req.user._id));
      const courseIds = teacherCourses.map(c => String(c._id));
      const grades = localDB.getGrades().filter(g => courseIds.includes(String(g.courseId)));
      const avg = grades.length > 0 
        ? Math.round(grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length * 100) / 100 
        : 0;

      return res.json({
        success: true,
        statistics: {
          totalGraded: grades.length,
          averagePercentage: avg,
          totalCourses: teacherCourses.length
        }
      });
    }
  } catch (error) {
    console.error('Grade stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching grade statistics'
    });
  }
};

module.exports = {
  getStudentGrades,
  getCourseGrades,
  updateGrade,
  getStudentCoursePerformance,
  getGradeStats
};
