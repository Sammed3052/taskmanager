// routes/suggestionRoutes.js
const express = require("express");
const router = express.Router();
const Suggestion = require("../models/Suggestion");
const verifyToken = require("../middleware/verifyToken");
const Project = require("../models/Project");

// ✅ Create new suggestion (tester → PM)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { taskId, projectId, title, description } = req.body;
    const testerId = req.user.id;

    // 🔍 Fetch project to get PM id
    const project = await Project.findById(projectId).select("pm createdBy");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const pmId = project.pm || project.createdBy; // adjust based on your schema

    const newSuggestion = new Suggestion({
      taskId,
      projectId,
      pmId,
      testerId,
      title,
      description,
    });

    await newSuggestion.save();
    res.status(201).json({
      message: "Suggestion sent successfully!",
      suggestion: newSuggestion,
    });
  } catch (err) {
    console.error("❌ Error creating suggestion:", err);
    res.status(500).json({
      message: "Failed to send suggestion",
      error: err.message,
    });
  }
});

// ✅ Get all suggestions for a specific PM (by pmId param — for Admin use)
router.get("/pm/:pmId", verifyToken, async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ pmId: req.params.pmId })
      .populate("taskId", "title")
      .populate("projectId", "name")
      .populate("pmId", "name email")
      .populate("testerId", "empId role");

    res.json(suggestions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch suggestions", error: err.message });
  }
});

// ✅ Get suggestions for the logged-in PM
router.get("/pm", verifyToken, async (req, res) => {
  try {
    const pmId = req.user.id;

    const suggestions = await Suggestion.find({ pmId })
      .populate("taskId", "title")
      .populate("projectId", "name")
      .populate("testerId", "empId role")
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (err) {
    console.error("❌ Error fetching PM-specific suggestions:", err);
    res
      .status(500)
      .json({ error: "Server error fetching PM suggestions" });
  }
});

// ✅ Get all suggestions (all PMs) – optional (Admin view)
router.get("/", verifyToken, async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .populate("taskId", "title")  
      .populate("projectId", "name")
      .populate("testerId", "empId name")
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (err) {
    console.error("❌ Error fetching tester suggestions:", err);
    res.status(500).json({ error: "Server error fetching suggestions" });
  }
});

// ✅ Update suggestion status (approve/reject + send notification)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    console.log("➡️ PUT /suggestions/:id route hit");

    const { status } = req.body;
    console.log("📥 Incoming status:", status);

    if (!["Pending", "Valid", "Invalid"].includes(status)) {
      console.warn("⚠️ Invalid status provided:", status);
      return res.status(400).json({ message: "Invalid status" });
    }

    // 🔍 Find suggestion first
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      console.warn("❌ Suggestion not found with ID:", req.params.id);
      return res.status(404).json({ message: "Suggestion not found" });
    }
    console.log("✅ Suggestion found:", suggestion._id);

    // ✅ Update status
    suggestion.status = status;
    await suggestion.save();
    console.log("📝 Suggestion status updated:", suggestion.status);

    // ✅ Create notification for the employee/tester who sent the suggestion
    const Notification = require("../models/Notification");

    const notification = new Notification({
      sender: req.user.id, // PM who updated
      senderModel: "PM",
      receiver: suggestion.testerId, // employee/tester who created suggestion
      receiverModel: "Employee",
      type: "SuggestionReview",
      message: `Your suggestion "${suggestion.title}" has been ${status}.`,
    });

    console.log("📦 Notification prepared:", notification);

    await notification.save();
    console.log("✅ Notification saved:", notification._id);

    res.json({
      message: `Suggestion ${status} successfully.`,
      suggestion,
      notification,
    });
  } catch (err) {
    console.error("❌ Error updating suggestion:", err);
    res.status(500).json({
      message: "Failed to update suggestion",
      error: err.message,
    });
  }
});


module.exports = router;
