const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    // 🔹 Task Details
    title: { type: String, required: true },
    description: { type: String, default: '' },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    tester: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    dueDate: { type: Date, required: true },

    // 🔹 Task Lifecycle Status
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'submitted'],
      default: 'pending',
    },

    // 🔹 Document (if uploaded)
    documentUrl: { type: String, default: null },

    // 🔹 PM who created the task
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'PM', required: true },

    // -----------------------------
    // 🔹 Developer Submission Fields
    // -----------------------------
    code: {
      type: String,
      trim: true,
      default: '',
    },

    submissionStatus: {
      type: String,
      enum: ['pending', 'tested', 'submitted'],
      default: 'pending',
    },

    // Optional Tester feedback
    testerFeedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

module.exports = mongoose.model('Task', TaskSchema);
