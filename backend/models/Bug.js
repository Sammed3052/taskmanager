const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // store reference instead of name
      required: true,
    },
    bugTitle: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    description: {
      type: String,
      required: true,
    },
    bugFile: {
      type: String, // Cloudinary URL
      default: "",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Tester ID
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Developer who coded the task
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed"], // simplified lifecycle
      default: "Pending", // when tester creates bug
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bug", bugSchema);
