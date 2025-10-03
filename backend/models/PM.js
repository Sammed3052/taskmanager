const mongoose = require("mongoose");

const PMSchema = new mongoose.Schema({
  pmId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  profilePic: { type: String, required: true }, // now compulsory
  address: { type: String, default: null }, // optional

  // OTP fields for forgot-password
  resetOtp: { type: String, default: null },
  resetOtpExpiry: { type: Date, default: null }
}, { timestamps: true }); // automatically adds createdAt and updatedAt

module.exports = mongoose.model("PM", PMSchema);
