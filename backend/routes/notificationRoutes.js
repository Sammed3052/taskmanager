// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Notification = require("../models/Notification");

// ✅ Get notifications for logged-in user (developer/tester)
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("🔑 Logged-in user payload:", req.user);

    // Check what ID we’re querying with
    console.log("🆔 Looking for notifications with receiver =", req.user.id);

    const notifications = await Notification.find({
      receiver: req.user.id, // only for logged-in user
    }).sort({ createdAt: -1 });

    // Log what we got from DB
    console.log("📬 Notifications found:", notifications.length);
    if (notifications.length > 0) {
      notifications.forEach((n, idx) => {
        console.log(
          `   [${idx + 1}] Receiver: ${n.receiver}, Message: ${n.message}`
        );
      });
    } else {
      console.log("⚠️ No notifications found for this user");
    }

    res.json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// ✅ PATCH /api/notifications/:id/read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const note = await Notification.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Notification not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
});
 // ✅ PATCH /api/notifications/read-all
router.patch("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

// routes/notificationRoutes.js
router.post("/:id/action", verifyToken, async (req, res) => {
  try {
    const { action, bugId } = req.body;
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    // ✅ Only receiver (tester) can take action
    if (notification.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const Bug = require("../models/Bug"); // import Bug here
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    // 🔄 Update bug status based on action
    if (action === "Accept") {
      bug.status = "Completed";
    } else if (action === "Reject") {
      bug.status = "Pending";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await bug.save();

    // ✅ Mark notification as read
    notification.isRead = true;
    notification.actionTaken = action;
    notification.actions = [];
    await notification.save();

    res.json({ message: `Bug ${action}ed successfully`, bug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to process action" });
  }
});


module.exports = router;
