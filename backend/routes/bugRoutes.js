const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const verifyToken = require("../middleware/verifyToken");
const Bug = require("../models/Bug");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

// Report a Bug (Tester)
router.post("/", verifyToken, upload.single("bugFile"), async (req, res) => {
  try {
    // 1️⃣ Find the task
    const task = await Task.findById(req.body.taskId).populate("project");
    if (!task) return res.status(404).json({ error: "Task not found" });

    // 2️⃣ Create Bug with status = Pending
    const newBug = new Bug({
      taskId: task._id,
      projectId: task.project,
      bugTitle: req.body.bugTitle,
      module: req.body.module,
      severity: req.body.severity,
      description: req.body.description,
      bugFile: req.file ? (req.file.path || req.file.secure_url) : "",
      reportedBy: req.user.id, // Tester (from token)
      developerId: task.developer,
      status: "Pending", // 👈 default
    });

    await newBug.save();

    res.status(201).json({
      message: "🐞 Bug reported successfully",
      bug: newBug,
    });
  } catch (err) {
    console.error("❌ Error creating bug:", err);
    res.status(500).json({ error: "Server error while reporting bug" });
  }
});

// Update Bug Status (Developer or Tester)
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ error: "Bug not found" });

    // Allowed statuses: Pending / InProgress / Completed
    const validStatuses = ["Pending", "InProgress", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    bug.status = status;
    await bug.save();

    // 🔔 Create notification for the tester
// 🔔 Create notification for the tester
await Notification.create({
  receiver: bug.reportedBy,
  receiverModel: "Employee",
  sender: req.user.id,
  senderModel: "Employee",
  message: `Bug "${bug.bugTitle}" has been modified. Please Accept or Reject.`,
  actions: ["Accept", "Reject"],
  bugId: bug._id
});

    res.json({ message: `✅ Bug status updated to ${status}`, bug });
  } catch (err) {
    console.error("❌ Error updating bug status:", err);
    res.status(500).json({ error: "Server error while updating bug status" });
  }
});

// Get All Bugs (Admin/PM)
router.get("/", verifyToken, async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate("taskId", "title description status")
      .populate("projectId", "name deadline status")
      .populate("reportedBy", "empId role")
      .populate("developerId", "empId role");

    res.json(bugs);
  } catch (err) {
    console.error("❌ Error fetching bugs:", err);
    res.status(500).json({ error: "Server error while fetching bugs" });
  }
});

// Get Bugs assigned to logged-in Developer
router.get("/assigned", verifyToken, async (req, res) => {
  try {
    const developerId = req.user.id;

    const bugs = await Bug.find({ developerId })
      .populate("taskId", "title description status")
      .populate("projectId", "name pmId status")
      .populate("reportedBy", "empId role");

    res.json(bugs);
  } catch (err) {
    console.error("❌ Error fetching assigned bugs:", err);
    res.status(500).json({ error: "Server error while fetching assigned bugs" });
  }
});

// Get Bugs reported by logged-in Tester
router.get("/my", verifyToken, async (req, res) => {
  try {
    const bugs = await Bug.find({ reportedBy: req.user.id })
      .populate("taskId", "title description status")
      .populate("projectId", "name pmId status")
      .populate("developerId", "empId role");

    res.json(bugs);
  } catch (err) {
    console.error("❌ Error fetching my bug reports:", err);
    res.status(500).json({ error: "Server error while fetching my bug reports" });
  }
});

// Get Bugs assigned to Developer (duplicate of /assigned but with more info)
router.get("/dev", verifyToken, async (req, res) => {
  try {
    const devId = req.user.id;
    const bugs = await Bug.find({ developerId: devId })
      .populate("projectId", "name pm createdBy")
      .populate("taskId", "title")
      .populate("reportedBy", "name email");

    res.json(bugs);
  } catch (err) {
    console.error("❌ Error fetching bugs for dev:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
