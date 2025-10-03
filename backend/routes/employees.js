const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const verifyToken = require("../middleware/verifyToken");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ✅ Cloudinary integration (Multer middleware)
const upload = require("../middleware/pmUpload"); // multer + Cloudinary

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ⚡ Email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ========================= Routes ========================= //

// ✅ Create new employee
router.post("/", verifyToken, async (req, res) => {
  try {
    const { empId, password, role, email } = req.body;

    if (!empId || !password || !role || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingEmp = await Employee.findOne({ empId, role });
    if (existingEmp) {
      return res
        .status(400)
        .json({ error: "Employee ID already exists for this role" });
    }

    const newEmp = new Employee({
      empId,
      password,
      role,
      email,
      status: "Active",
      createdBy: req.user.id,
    });

    await newEmp.save();

    // Send credentials email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newEmp.email,
      subject: "Your Employee Account Credentials",
      html: `
        <h3>Welcome to the Team!</h3>
        <p>Here are your login credentials:</p>
        <ul>
          <li><b>Employee ID:</b> ${newEmp.empId}</li>
          <li><b>Password:</b> ${newEmp.password}</li>
          <li><b>Role:</b> ${newEmp.role}</li>
        </ul>
        <p>Please log in using these credentials.</p>
        <p>Thank You.</p>
      `,
    };

    transporter.sendMail(mailOptions).catch(console.error);

    res.status(201).json({
      message: "Employee created successfully",
      employee: {
        id: newEmp._id,
        empId: newEmp.empId,
        role: newEmp.role,
        email: newEmp.email,
        status: newEmp.status,
      },
    });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch all employees created by this PM
router.get("/", verifyToken, async (req, res) => {
  try {
    const employees = await Employee.find({ createdBy: req.user.id }).select(
      "-password"
    );
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch developers
router.get("/developers", verifyToken, async (req, res) => {
  try {
    const developers = await Employee.find({
      role: "Developer",
      status: "Active",
      createdBy: req.user.id,
    }).select("_id empId");
    res.json(developers);
  } catch (err) {
    console.error("Error fetching developers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch testers
router.get("/testers", verifyToken, async (req, res) => {
  try {
    const testers = await Employee.find({
      role: "Tester",
      status: "Active",
      createdBy: req.user.id,
    }).select("_id empId");
    res.json(testers);
  } catch (err) {
    console.error("Error fetching testers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update employee status
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updated = await Employee.findByIdAndUpdate(
      id,
      { status },
      { new: true, select: "-password" }
    );

    if (!updated) return res.status(404).json({ error: "Employee not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating employee status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete employee
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Employee not found" });

    res.json({ message: "Employee removed successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Employee login
router.post("/login", async (req, res) => {
  try {
    const { empId, password, role } = req.body;

    if (!empId || !password || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const employee = await Employee.findOne({ empId, password, role });

    if (!employee) return res.status(401).json({ error: "Invalid credentials." });

    if (employee.status !== "Active") {
      return res.status(403).json({ error: "Account inactive. Contact admin." });
    }

    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      empId: employee.empId,
      role: employee.role,
      id: employee._id,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

// ✅ Get logged-in employee profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select("-password");
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.json({
      ...employee.toObject(),
      name: employee.name || "N/A",
      mobile: employee.mobile || "N/A",
      address: employee.address || "N/A",
      profilePhoto: employee.profilePhoto || "",
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update logged-in employee profile
router.patch(
  "/profile",
  verifyToken,
  upload.single("profilePicture"), // multer file field name: profilePicture
  async (req, res) => {
    try {
      const { name, mobile, address } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (mobile !== undefined) updateData.mobile = mobile.trim();
      if (address !== undefined) updateData.address = address.trim();

      // Save uploaded image URL from Cloudinary
      if (req.file && req.file.path) updateData.profilePhoto = req.file.path;

      const updatedEmployee = await Employee.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true, runValidators: true, select: "-password" }
      );

      if (!updatedEmployee)
        return res.status(404).json({ error: "Employee not found" });

      res.json({
        message: "Profile updated successfully",
        employee: updatedEmployee,
      });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
