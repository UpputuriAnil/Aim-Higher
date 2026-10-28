const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: 1,
    default: 100
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  instructions: {
    type: String,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },
  submissionType: {
    type: String,
    enum: ['file', 'text', 'both'],
    default: 'file'
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto set publishedAt when assignment is published
assignmentSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for submissions count
assignmentSchema.virtual('submissionsCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignmentId',
  count: true
});

// Method to check if assignment is overdue
assignmentSchema.methods.isOverdue = function() {
  return new Date() > this.dueDate;
};

// Method to check if late submission is allowed
assignmentSchema.methods.canSubmitLate = function() {
  return this.allowLateSubmission;
};

// Method to calculate late penalty
assignmentSchema.methods.calculateLatePenalty = function() {
  if (!this.isOverdue() || !this.allowLateSubmission) {
    return 0;
  }
  return this.latePenalty;
};

module.exports = mongoose.model('Assignment', assignmentSchema);
