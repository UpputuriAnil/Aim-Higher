const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  duration: {
    type: String,
    required: [true, 'Course duration is required'],
    trim: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  category: {
    type: String,
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Mathematics', 'Other'],
    default: 'Other'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  materials: [{
    type: {
      type: String,
      enum: ['video', 'document', 'link', 'image'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: String,
    duration: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto set publishedAt when course is published
courseSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Virtual for materials count
courseSchema.virtual('materialsCount').get(function() {
  return this.materials.length;
});

// Method to enroll student
courseSchema.methods.enrollStudent = function(studentId) {
  const alreadyEnrolled = this.enrolledStudents.some(
    enrollment => enrollment.studentId.toString() === studentId.toString()
  );
  
  if (!alreadyEnrolled) {
    this.enrolledStudents.push({
      studentId: studentId,
      enrolledAt: new Date(),
      progress: 0
    });
    return true;
  }
  return false;
};

// Method to update student progress
courseSchema.methods.updateProgress = function(studentId, progress) {
  const enrollment = this.enrolledStudents.find(
    enrollment => enrollment.studentId.toString() === studentId.toString()
  );
  
  if (enrollment) {
    enrollment.progress = Math.min(100, Math.max(0, progress));
    return true;
  }
  return false;
};

module.exports = mongoose.model('Course', courseSchema);
