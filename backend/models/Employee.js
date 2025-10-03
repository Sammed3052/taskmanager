const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["Developer", "Tester"] },
    email: { type: String, required: true, unique: true },
    status: { type: String, default: "Active" },

    // 🔹 Profile fields
    name: { type: String, default: "N/A" },
    mobile: { type: String, default: "N/A" },
    address: { type: String, default: "N/A" },
    profilePhoto: { type: String, default: "" }, // URL/path to image

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "PM" }, // PM ID
  },
  { timestamps: true } // ✅ adds createdAt & updatedAt
);

module.exports = mongoose.model("Employee", employeeSchema);
