const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// ✅ Submit code for a task (first time)
router.post('/', async (req, res) => {
  try {
    const { taskId, code } = req.body;

    // Validation
    if (!taskId || !code || code.trim() === '') {
      return res.status(400).json({ message: '❌ Task ID and Code are required.' });
    }

    // Check if submission already exists
    let submission = await Submission.findOne({ task: taskId });

    if (submission) {
      return res.status(400).json({ message: '❌ Code already submitted. Use modify instead.' });
    }

    // Save new submission
    const newSubmission = new Submission({
      task: taskId,
      code: code.trim(),
      status: "pending"   // default pending
    });

    await newSubmission.save();

    res.json({
      message: '✅ Submission successful!',
      submission: newSubmission
    });

  } catch (err) {
    console.error('Error saving submission:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// ✅ Modify existing submission (update code and/or status)
router.put('/:id', async (req, res) => {
  try {
    const { code, status } = req.body;

    // Build update object dynamically
    const updateData = {};
    if (code && code.trim() !== '') updateData.code = code.trim();
    if (status) updateData.status = status; // status can be "pending", "submitted", etc.

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: '❌ Nothing to update.' });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: '❌ Submission not found.' });
    }

    res.json({
      message: '✅ Submission updated successfully!',
      submission
    });

  } catch (err) {
    console.error('Error updating submission:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// ✅ Get submission for a task
router.get('/task/:taskId', async (req, res) => {
  try {
    const submission = await Submission.findOne({ task: req.params.taskId });
    if (!submission) {
      return res.json({ submitted: false });
    }
    res.json({
      submitted: true,
      code: submission.code,
      status: submission.status,
      id: submission._id
    });
  } catch (err) {
    console.error('Error fetching submission:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

module.exports = router;
