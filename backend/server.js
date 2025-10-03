const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// 🌐 CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 📦 JSON parser
app.use(express.json());

// 🛢️ MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow_new')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 🔀 Route imports
const authRoutes = require("./routes/authRoutes");
const pmRoutes = require('./routes/pmRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/tasks');
const employeeRoutes = require('./routes/employees');
const submissionRoutes = require('./routes/submissionRoutes'); // ✅ Updated
const bugRoutes = require("./routes/bugRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");



// 🚏 Routes
app.use("/api/auth", authRoutes);
app.use('/api/pm', pmRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/submissions', submissionRoutes); // ✅ Now only saves code
app.use("/api/bugs", bugRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/notifications", notificationRoutes);  // 👈 very important!




// 🔴 Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(400).json({ message: err.message || 'Unexpected error occurred' });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
