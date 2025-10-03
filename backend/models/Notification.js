const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel", // dynamic reference to Employee or PM
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Employee", "PM"], // identifies which model sender belongs to
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverModel", // dynamic reference to Employee or PM
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ["Employee", "PM"], // identifies which model receiver belongs to
    },

    type: {
      type: String,
      enum: ["Bug", "Task", "Project", "SuggestionReview", "General"], // allowed notification categories
      default: "General",
    },

    message: {
      type: String,
      required: true, // notification content
    },

    isRead: {
      type: Boolean,
      default: false, // unread by default
    },
     actions: {
      type: [String],   // e.g., ["Accept","Reject"]
      enum: ["Accept", "Reject"],
      default: [],      // empty array if no actions
    },

     actionTaken: {
      type: String,
      enum: ["Accept", "Reject", null],
      default: null,
    },
    
    bugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",       // link to the Bug document
    },
    

  },
  { timestamps: true } // adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Notification", notificationSchema);

