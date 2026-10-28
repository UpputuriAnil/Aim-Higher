const { validationResult } = require('express-validator');
const localDB = require('../utils/localDB');

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Teacher only)
const createCourse = async (req, res) => {
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
      duration,
      category = 'Programming',
      difficulty = 'Beginner',
      price = 0,
      tags = '',
      thumbnail = ''
    } = req.body;

    const parsedTags = Array.isArray(tags) 
      ? tags 
      : (typeof tags === 'string' && tags.trim() ? tags.split(',').map(t => t.trim()) : []);

    const course = localDB.createCourse({
      title,
      description,
      duration,
      teacherId: req.user._id,
      category,
      difficulty,
      price: parseFloat(price) || 0,
      tags: parsedTags,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      isPublished: true
    });

    await course.populate('teacherId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating course'
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true, isPublished: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const allMatching = await localDB.findCourses(query)
      .populate('teacherId', 'name email')
      .sort(sortOptions);

    const total = allMatching.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedCourses = allMatching.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      courses: paginatedCourses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching courses'
    });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const rawCourse = localDB.getCourseById(req.params.id);

    if (!rawCourse || rawCourse.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = localDB.wrapModel(rawCourse);
    await course.populate('teacherId', 'name email bio profileImage');
    await course.populate('enrolledStudents', 'studentId');

    res.json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Teacher only)
const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const course = localDB.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (String(course.teacherId) !== String(req.user._id) && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const {
      title,
      description,
      duration,
      category,
      difficulty,
      price,
      tags,
      isPublished,
      thumbnail
    } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (duration) updates.duration = duration;
    if (category) updates.category = category;
    if (difficulty) updates.difficulty = difficulty;
    if (price !== undefined) updates.price = parseFloat(price);
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }
    if (isPublished !== undefined) updates.isPublished = Boolean(isPublished);
    if (thumbnail) updates.thumbnail = thumbnail;

    const updated = localDB.updateCourse(req.params.id, updates);
    await updated.populate('teacherId', 'name email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      course: updated
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating course'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Teacher only)
const deleteCourse = async (req, res) => {
  try {
    const course = localDB.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (String(course.teacherId) !== String(req.user._id) && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    localDB.deleteCourse(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting course'
    });
  }
};

// @desc    Get teacher's courses
// @route   GET /api/courses/teacher/my-courses
// @access  Private (Teacher only)
const getTeacherCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status = 'all'
    } = req.query;

    // Teachers can view all active curriculum courses in their portal
    let courses = await localDB.findCourses({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('enrolledStudents', 'studentId');

    if (status === 'published') courses = courses.filter(c => c.isPublished);
    if (status === 'draft') courses = courses.filter(c => !c.isPublished);

    const total = courses.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedCourses = courses.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      courses: paginatedCourses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get teacher courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching teacher courses'
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student only)
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user._id;

    const course = localDB.getCourseById(courseId);
    if (!course || course.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check existing active enrollment
    const existingEnrollment = localDB.findEnrollment({
      studentId,
      courseId,
      status: 'active'
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    const enrollment = localDB.createEnrollment({
      studentId,
      courseId
    });

    // Notify student & teacher
    localDB.createNotification({
      userId: studentId,
      title: 'Enrolled Successfully',
      message: `You have enrolled in "${course.title}". Start exploring the materials and assignments!`,
      type: 'enrollment',
      link: `/student/courses/${courseId}`
    });

    localDB.createNotification({
      userId: course.teacherId,
      title: 'New Student Enrollment',
      message: `${req.user.name} enrolled in "${course.title}".`,
      type: 'enrollment',
      link: `/teacher/courses`
    });

    await enrollment.populate('courseId', 'title description thumbnail duration');

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully',
      enrollment
    });

  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error enrolling in course'
    });
  }
};

// @desc    Get student's enrolled courses
// @route   GET /api/courses/student/enrolled
// @access  Private (Student only)
const getStudentEnrolledCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12
    } = req.query;

    const enrollments = await localDB.findEnrollments({
      studentId: req.user._id,
      status: 'active'
    }).populate('courseId', 'title description thumbnail duration category difficulty')
      .sort({ enrolledAt: -1 });

    const total = enrollments.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = enrollments.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      courses: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrolled courses'
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getTeacherCourses,
  enrollInCourse,
  getStudentEnrolledCourses
};
