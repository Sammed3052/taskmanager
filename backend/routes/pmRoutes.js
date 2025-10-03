const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const PM = require('../models/PM');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); 
const upload = require('../middleware/pmUpload'); // your Cloudinary multer setup

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ======================= PM Registration =======================
router.post('/register', upload.single('profilePic'), async (req, res) => {
  const { name, email, password, mobile, address } = req.body;

  // Validate required fields (except address)
  if (!name || !email || !password || !mobile || !req.file) {
    return res.status(400).json({ error: 'All fields except address are required' });
  }

  try {
    const existing = await PM.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const pmId = 'PM' + Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);

    // profilePicUrl comes from multer-storage-cloudinary
    const profilePicUrl = req.file.path;

    const newPM = new PM({
      pmId,
      name,
      email,
      password: hashedPassword,
      mobile,
      profilePic: profilePicUrl,
      address: address || null
    });

    await newPM.save();

    // Generate JWT token
    const token = jwt.sign({ id: newPM._id, pmId: newPM.pmId }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'PM registered successfully',
      pmId,
      token,
      pm: {
        pmId: newPM.pmId,
        name: newPM.name,
        email: newPM.email,
        mobile: newPM.mobile,
        profilePic: newPM.profilePic,
        address: newPM.address
      }
    });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================= PM Login =======================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pm = await PM.findOne({ email });
    if (!pm) return res.status(404).json({ error: 'PM not found' });

    const isMatch = await bcrypt.compare(password, pm.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: pm._id, pmId: pm.pmId }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      pm: {
        pmId: pm.pmId,
        name: pm.name,
        email: pm.email,
        mobile: pm.mobile,
        profilePic: pm.profilePic,
        address: pm.address
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================= Forgot Password =======================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const pm = await PM.findOne({ email });
    if (!pm) return res.status(404).json({ error: 'Email not found' });

    const otp = crypto.randomInt(100000, 999999).toString();

    pm.resetOtp = otp;
    pm.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await pm.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"TaskFlow App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `<h3>Your OTP is:</h3><h2>${otp}</h2><p>Expires in 5 minutes</p>`,
    });

    res.json({ message: '✅ OTP sent to your email' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================= Verify OTP =======================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pm = await PM.findOne({ email });
    if (!pm) return res.status(404).json({ error: 'Email not found' });

    if (!pm.resetOtp || pm.resetOtp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (Date.now() > pm.resetOtpExpiry) return res.status(400).json({ error: 'OTP expired' });

    res.json({ message: '✅ OTP verified, you can now reset your password' });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================= Reset Password =======================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const pm = await PM.findOne({ email });
    if (!pm) return res.status(404).json({ error: 'Email not found' });

    if (!pm.resetOtp || pm.resetOtp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (Date.now() > pm.resetOtpExpiry) return res.status(400).json({ error: 'OTP expired' });

    pm.password = await bcrypt.hash(newPassword, 10);
    pm.resetOtp = undefined;
    pm.resetOtpExpiry = undefined;
    await pm.save();

    res.json({ message: '✅ Password reset successful' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================= Get Logged-in PM Profile =======================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const pm = await PM.findById(req.user.id).select('-password -resetOtp -resetOtpExpiry');
    if (!pm) return res.status(404).json({ error: 'PM not found' });

    res.json(pm);
  } catch (err) {
    console.error('Fetch PM profile error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
