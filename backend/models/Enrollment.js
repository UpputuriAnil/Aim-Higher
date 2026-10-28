const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completionDate: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  totalTimeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  materialsCompleted: [{
    materialId: String,
    completedAt: Date,
    timeSpent: Number // in minutes
  }],
  assignmentsCompleted: [{
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    completedAt: Date,
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade'
    }
  }],
  currentMaterial: {
    materialId: String,
    lastAccessedAt: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    ratedAt: Date
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateUrl: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Pre-save middleware to update last accessed time
enrollmentSchema.pre('save', function(next) {
  if (this.isModified('progress') || this.isModified('materialsCompleted')) {
    this.lastAccessedAt = new Date();
    
    // Check if course is completed
    if (this.progress >= 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completionDate = new Date();
    }
  }
  next();
});

// Method to update progress
enrollmentSchema.methods.updateProgress = function(materialsCompletedCount, totalMaterials) {
  if (totalMaterials > 0) {
    this.progress = Math.round((materialsCompletedCount / totalMaterials) * 100);
  }
  return this.save();
};

// Method to mark material as completed
enrollmentSchema.methods.completeMaterial = function(materialId, timeSpent = 0) {
  const existingMaterial = this.materialsCompleted.find(
    material => material.materialId === materialId
  );
  
  if (!existingMaterial) {
    this.materialsCompleted.push({
      materialId: materialId,
      completedAt: new Date(),
      timeSpent: timeSpent
    });
    this.totalTimeSpent += timeSpent;
  } else {
    // Update time spent if material already completed
    existingMaterial.timeSpent += timeSpent;
    this.totalTimeSpent += timeSpent;
  }
  
  this.currentMaterial = {
    materialId: materialId,
    lastAccessedAt: new Date()
  };
  
  return this.save();
};

// Method to mark assignment as completed
enrollmentSchema.methods.completeAssignment = function(assignmentId, gradeId) {
  const existingAssignment = this.assignmentsCompleted.find(
    assignment => assignment.assignmentId.toString() === assignmentId.toString()
  );
  
  if (!existingAssignment) {
    this.assignmentsCompleted.push({
      assignmentId: assignmentId,
      completedAt: new Date(),
      grade: gradeId
    });
  }
  
  return this.save();
};

// Method to drop course
enrollmentSchema.methods.dropCourse = function(reason = '') {
  this.status = 'dropped';
  this.notes = reason || this.notes;
  return this.save();
};

// Method to rate course
enrollmentSchema.methods.rateCourse = function(score, review = '') {
  this.rating = {
    score: score,
    review: review,
    ratedAt: new Date()
  };
  return this.save();
};

// Method to issue certificate
enrollmentSchema.methods.issueCertificate = function(certificateUrl) {
  this.certificate = {
    issued: true,
    issuedAt: new Date(),
    certificateUrl: certificateUrl
  };
  return this.save();
};

// Static method to get enrollment statistics
enrollmentSchema.statics.getEnrollmentStats = function(courseId) {
  return this.aggregate([
    {
      $match: {
        courseId: mongoose.Types.ObjectId(courseId),
        isActive: true
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageProgress: { $avg: '$progress' },
        averageTimeSpent: { $avg: '$totalTimeSpent' }
      }
    }
  ]);
};

// Static method to get student enrollments
enrollmentSchema.statics.getStudentEnrollments = function(studentId, status = null) {
  const query = { studentId: mongoose.Types.ObjectId(studentId), isActive: true };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('courseId', 'title description thumbnail teacherId')
    .sort({ enrolledAt: -1 });
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
