const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const verifyToken = require('../middleware/verifyToken');
const Task = require('../models/Task');

// ✅ Create a new project
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, status, deadline, totalTasks } = req.body;

    const newProject = new Project({
      name,
      description,
      status: 'Pending',
      deadline,
      totalTasks,
      createdBy: req.user.id, // ✅ Use MongoDB ObjectId
    });

    await newProject.save();

    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (err) {
    console.error('❌ Error saving project:', err.message);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ✅ Fetch all projects created by the logged-in PM
router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id });
    res.status(200).json(projects);
  } catch (err) {
    console.error('❌ Error fetching projects:', err.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id → fetch single project by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error('❌ Error fetching project:', err.message);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});
 // PATCH /api/projects/:id → update project status
router.patch('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['Pending', 'In Progress', 'Completed'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.status = status;
    await project.save();

    res.json({ message: 'Project status updated', project });
  } catch (err) {
    console.error('Error updating project status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
