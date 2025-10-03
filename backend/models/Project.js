const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed'], // ✅ Only allow these values
    default: 'Pending' // You can set the default as Pending
  },
  deadline: Date,
  totalTasks: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'PM' } // ✅ Proper reference
});

module.exports = mongoose.model('Project', projectSchema);
