const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  textContent: {
    type: String,
    maxlength: [5000, 'Text content cannot exceed 5000 characters']
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
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned'],
    default: 'submitted'
  },
  grade: {
    marks: {
      type: Number,
      min: 0
    },
    maxMarks: {
      type: Number,
      min: 1
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  plagiarismScore: {
    type: Number,
    min: 0,
    max: 100
  },
  resubmitted: {
    type: Boolean,
    default: false
  },
  resubmittedAt: Date,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate submissions
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

// Pre-save middleware to check if submission is late
submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Assignment = mongoose.model('Assignment');
      const assignment = await Assignment.findById(this.assignmentId);
      if (assignment && this.submittedAt > assignment.dueDate) {
        this.isLate = true;
      }
    } catch (error) {
      console.error('Error checking submission timing:', error);
    }
  }
  this.lastModified = new Date();
  next();
});

// Method to grade submission
submissionSchema.methods.setGrade = function(marks, maxMarks, gradedBy, feedback = '', remarks = '') {
  this.grade = {
    marks: marks,
    maxMarks: maxMarks,
    percentage: maxMarks > 0 ? (marks / maxMarks) * 100 : 0,
    gradedAt: new Date(),
    gradedBy: gradedBy
  };
  this.feedback = feedback;
  this.remarks = remarks;
  this.status = 'graded';

  // Apply late penalty if applicable
  if (this.isLate) {
    try {
      const Assignment = mongoose.model('Assignment');
      Assignment.findById(this.assignmentId).then(assignment => {
        if (assignment && assignment.allowLateSubmission && assignment.latePenalty > 0) {
          this.grade.marks = Math.max(0, this.grade.marks - (this.grade.marks * assignment.latePenalty / 100));
          this.grade.percentage = (this.grade.marks / this.grade.maxMarks) * 100;
        }
      });
    } catch (error) {
      console.error('Error applying late penalty:', error);
    }
  }

  return this.save();
};

// Method to resubmit
submissionSchema.methods.resubmit = function(textContent, attachments = []) {
  this.textContent = textContent;
  this.attachments = attachments;
  this.resubmitted = true;
  this.resubmittedAt = new Date();
  this.status = 'submitted';
  this.grade = undefined;
  this.feedback = '';
  this.remarks = '';
  return this.save();
};

// Virtual for formatted submission date
submissionSchema.virtual('submittedAtFormatted').get(function() {
  return this.submittedAt.toLocaleDateString() + ' ' + this.submittedAt.toLocaleTimeString();
});

module.exports = mongoose.model('Submission', submissionSchema);
