const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const verifyToken = require('../middleware/verifyToken');

const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Project = require('../models/Project'); 

// -----------------------------
// Create Task (PM assigns Dev + Tester)
// -----------------------------
router.post('/', verifyToken, upload.single('document'), async (req, res) => {
  try {
    const { title, description, developer, tester, project, dueDate } = req.body;

    if (!title || !developer || !tester || !project || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // validate developer
    if (!mongoose.Types.ObjectId.isValid(developer)) {
      return res.status(400).json({ error: 'Invalid developer id' });
    }
    const dev = await Employee.findById(developer);
    if (!dev) return res.status(404).json({ error: 'Developer not found' });

    // validate tester
    if (!mongoose.Types.ObjectId.isValid(tester)) {
      return res.status(400).json({ error: 'Invalid tester id' });
    }
    const testerEmp = await Employee.findById(tester);
    if (!testerEmp) return res.status(404).json({ error: 'Tester not found' });

    const newTask = new Task({
      title,
      description: description || '',
      developer,
      tester,
      project,
      dueDate,
      status: 'pending', // default when created
      documentUrl: req.file?.path || null,
      createdBy: req.user.id,
    });

    await newTask.save();

    // ✅ Update project status if it is still 'Pending'
    const proj = await Project.findById(project);
    if (proj && proj.status === 'Pending') {
      proj.status = 'In Progress';
      await proj.save();
    }

    
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (err) {
    console.error('❌ Error creating task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -----------------------------
// Get all developers
// -----------------------------
router.get('/developers', verifyToken, async (req, res) => {
  try {
    const developers = await Employee.find({ role: 'Developer' }).select('_id empId empName');
    res.json(developers);
  } catch (err) {
    console.error('❌ Error fetching developers:', err);
    res.status(500).json({ error: 'Error fetching developers' });
  }
});

// -----------------------------
// Get all testers
// -----------------------------
router.get('/testers', verifyToken, async (req, res) => {
  try {
    const testers = await Employee.find({ role: 'Tester' }).select('_id empId empName');
    res.json(testers);
  } catch (err) {
    console.error('❌ Error fetching testers:', err);
    res.status(500).json({ error: 'Error fetching testers' });
  }
});

// -----------------------------
// Get tasks assigned to logged-in user
// -----------------------------
router.get('/assigned', verifyToken, async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.user.id);

    const tasks = await Task.find({
      $or: [{ developer: employeeId }, { tester: employeeId }]
    })
      .populate('project', 'name')
      .populate('createdBy', 'empName')
      .populate('developer', 'empName empId')
      .populate('tester', 'empName empId')
      .lean();

    const formattedTasks = tasks.map(task => ({
      ...task,
      status: task.status || 'pending',
      projectName: task.project?.name || 'N/A',
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('❌ Error fetching assigned tasks:', error);
    res.status(500).json({ error: 'Failed to fetch assigned tasks' });
  }
});

// ===================================================
// 🚀 SUBMISSION + TESTING FLOW
// ===================================================

// ✅ Developer submits code → status = in-progress
router.post('/:taskId/submit', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const { taskId } = req.params;

    if (!code || code.trim() === '') {
      return res.status(400).json({ message: '❌ Code is required.' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: '❌ Task not found.' });

    task.code = code.trim();
    task.status = 'in-progress'; // dev submitted
    task.submissionStatus = 'pending';

    await task.save();

    res.json({ message: '✅ Code submitted successfully!', task });
  } catch (err) {
    console.error('Error saving submission:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// ✅ Tester sends back to developer → status = pending
router.post('/:taskId/send-back', verifyToken, async (req, res) => {
  try {
    const { feedback } = req.body;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: '❌ Task not found.' });

    task.status = 'pending'; // goes back to developer
    task.submissionStatus = 'pending';
    if (feedback) task.testerFeedback = feedback;

    await task.save();

    res.json({ message: '🔄 Task sent back to Developer for modification.', task });
  } catch (err) {
    console.error('Error sending back:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// ✅ Tester approves (no bug) → status = submitted
// ✅ Tester approves (no bug) → status = submitted + send notifications
router.post('/:taskId/approve', verifyToken, async (req, res) => {
  try {
    const { report } = req.body;
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('developer', '_id empName')    // developer info
      .populate('createdBy', '_id empName');   // PM info

    if (!task) return res.status(404).json({ message: '❌ Task not found.' });

    // Update task status
    task.status = 'submitted';
    task.submissionStatus = 'submitted';
    task.testerFeedback = report || 'Approved by tester';

    await task.save();

    // Prepare notifications
    const Notification = require('../models/Notification');
    const notifications = [];

    // Notify PM (creator of task)
    if (task.createdBy?._id) {
      notifications.push({
        sender: req.user.id,
        senderModel: 'Employee',       // tester
        receiver: task.createdBy._id,
        receiverModel: 'PM',
        type: 'Task',
        message: `Task "${task.title}" has been approved by tester.`,
        actions: [],
      });
    }

    // Notify Developer (who submitted the code)
    if (task.developer?._id) {
      notifications.push({
        sender: req.user.id,
        senderModel: 'Employee',       // tester
        receiver: task.developer._id,
        receiverModel: 'Employee',
        type: 'Task',
        message: `Your task "${task.title}" has been approved by tester.`,
        actions: [],
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({
      message: '✅ Task approved & notifications sent!',
      task,
    });
  } catch (err) {
    console.error('❌ Error approving task:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// ✅ Get submission details for a task
router.get('/:taskId/submission', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: '❌ Task not found.' });

    if (!task.code) {
      return res.json({ submitted: false });
    }

    res.json({
      submitted: true,
      code: task.code,
      status: task.status,
      submissionStatus: task.submissionStatus,
      feedback: task.testerFeedback || null,
    });
  } catch (err) {
    console.error('Error fetching submission:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// ✅ Developer modifies code after tester send-back → status = in-progress
router.put('/:taskId/modify', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const { taskId } = req.params;

    if (!code || code.trim() === '') {
      return res.status(400).json({ message: '❌ Code is required.' });
    }

    const task = await Task.findById(taskId)
      .populate("testerId")  // assuming task has assigned tester
      .populate("projectId"); // optional: include project details

    if (!task) {
      return res.status(404).json({ message: '❌ Task not found.' });
    }

    // 📝 Update code & forward to tester again
    task.code = code.trim();
    task.status = 'in-progress';   // ✅ now tester can test again
    task.submissionStatus = 'pending';
    task.testerFeedback = null;    // clear old bug feedback after fix

    await task.save();

    // 🔔 Notify assigned tester
    if (task.testerId) {
      const Notification = require("../models/Notification");
      await Notification.create({
        user: task.testerId._id, // assigned tester
        message: `Developer resubmitted modified code for task: ${task.title}`,
        project: task.projectId?._id,
        bug: null, // not a bug, but task-level notification
        read: false,
      });
    }

    res.json({
      message: '✅ Bug fix submitted! Task moved back to In-Progress for testing.',
      task,
    });
  } catch (err) {
    console.error('❌ Error modifying code:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// GET /api/tasks/:taskId
router.get('/:taskId', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('project', 'name')
      .populate('createdBy', 'empName')
      .populate('developer', 'empName empId')
      .populate('tester', 'empName empId')
      .lean();

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({
      ...task,
      projectName: task.project?.name || 'N/A',
      assignedBy: task.createdBy?.empName || 'N/A',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all tasks for a project
router.get('/project/:projectId', async (req, res) => {
  console.log('Fetching tasks for project:', req.params.projectId); // 🔍
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('developer', 'name email')
      .populate('tester', 'name email');

    if (!tasks.length) {
      console.log('No tasks found for this project');
      return res.status(404).json({ message: 'No tasks found for this project' });
    }

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});



module.exports = router;
