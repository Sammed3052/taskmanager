const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/PM"); // PM/Employee model
const crypto = require("crypto");

// ✅ Step 1: Request OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP + expiry (5 mins) in DB
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jugalesammed@gmail.com", // your email
        pass: "cfnojfbwkwacswjc", // Gmail App Password
      },
    });

    // Send email with OTP
    await transporter.sendMail({
      from: '"TaskFlow App" <jugalesammed@gmail.com>',
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <h3>Use the OTP below to reset your password</h3>
        <h2>${otp}</h2>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    res.json({ message: "✅ OTP sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Step 2: Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > user.resetOtpExpiry) {
      return res.status(400).json({ error: "OTP expired" });
    }

    res.json({ message: "✅ OTP verified, you can now reset password" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Step 3: Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    if (!user.resetOtp || user.resetOtp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (Date.now() > user.resetOtpExpiry) return res.status(400).json({ error: "OTP expired" });

    // ✅ Hash new password
    const bcrypt = require("bcrypt");
    user.password = await bcrypt.hash(newPassword, 10);

    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;

    await user.save();

    res.json({ message: "✅ Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
