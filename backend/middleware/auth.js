const jwt = require('jsonwebtoken');
const MemoryDB = require('../utils/memoryDB');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  try {
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await MemoryDB.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Set user in request (exclude password)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized.`
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin/teacher
const checkOwnership = (resourceField = 'userId') => {
  return async (req, res, next) => {
    try {
      // Teachers and admins can access all resources
      if (req.user.role === 'teacher' || req.user.role === 'admin') {
        return next();
      }

      // Students can only access their own resources
      const resourceId = req.params.id || req.params.userId || req.body[resourceField];
      
      if (resourceId && resourceId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in ownership check.'
      });
    }
  };
};

// Check if user is enrolled in the course
const checkEnrollment = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    const userId = req.user._id;

    // Teachers can access all courses they created
    if (req.user.role === 'teacher') {
      const Course = require('../models/Course');
      const course = await Course.findById(courseId);
      
      if (course && course.teacherId.toString() === userId.toString()) {
        return next();
      }
    }

    // Check if student is enrolled
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not enrolled in this course.'
      });
    }

    req.enrollment = enrollment;
    next();

  } catch (error) {
    console.error('Enrollment check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in enrollment check.'
    });
  }
};

// Rate limiting for authentication endpoints
const createAuthRateLimit = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Optional: Refresh token middleware
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required.'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    // Generate new access token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    res.json({
      success: true,
      token,
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token.'
    });
  }
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  checkEnrollment,
  createAuthRateLimit,
  refreshToken
};
