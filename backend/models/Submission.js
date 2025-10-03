const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task', // reference to Task model
      required: true,
      unique: true, // ensures only one submission per task
    },
    code: {
      type: String,
      default: '',
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'tested', 'submitted'], // added 'submitted' for clarity
      default: 'pending', // default status
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // automatically manages createdAt & updatedAt
);

// Optional: index to enforce unique task submission
submissionSchema.index({ task: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
