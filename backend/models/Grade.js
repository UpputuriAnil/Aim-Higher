const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required']
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: [true, 'Submission ID is required']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: 0
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks are required'],
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  isLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenaltyApplied: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  rubricScores: [{
    criteria: String,
    score: Number,
    maxScore: Number,
    feedback: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate grades
gradeSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

// Pre-save middleware to calculate percentage and grade
gradeSchema.pre('save', function(next) {
  if (this.isModified('marks') || this.isModified('maxMarks')) {
    this.percentage = this.maxMarks > 0 ? (this.marks / this.maxMarks) * 100 : 0;
    this.letterGrade = this.calculateLetterGrade(this.percentage);
  }
  next();
});

// Method to calculate letter grade
gradeSchema.methods.calculateLetterGrade = function(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Method to apply late penalty
gradeSchema.methods.applyLatePenalty = function(penaltyPercentage) {
  if (penaltyPercentage > 0) {
    this.latePenaltyApplied = penaltyPercentage;
    this.marks = Math.max(0, this.marks - (this.marks * penaltyPercentage / 100));
    this.percentage = this.maxMarks > 0 ? (this.marks / this.maxMarks) * 100 : 0;
    this.letterGrade = this.calculateLetterGrade(this.percentage);
  }
  return this.save();
};

// Static method to get student average grade for a course
gradeSchema.statics.getStudentCourseAverage = function(studentId, courseId) {
  return this.aggregate([
    {
      $match: {
        studentId: mongoose.Types.ObjectId(studentId),
        courseId: mongoose.Types.ObjectId(courseId),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        averagePercentage: { $avg: '$percentage' },
        totalAssignments: { $sum: 1 },
        totalMarks: { $sum: '$marks' },
        totalMaxMarks: { $sum: '$maxMarks' }
      }
    }
  ]);
};

// Static method to get course statistics
gradeSchema.statics.getCourseStatistics = function(courseId) {
  return this.aggregate([
    {
      $match: {
        courseId: mongoose.Types.ObjectId(courseId),
        isActive: true
      }
    },
    {
      $group: {
        _id: '$letterGrade',
        count: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

module.exports = mongoose.model('Grade', gradeSchema);
