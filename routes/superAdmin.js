// routes/superAdmin.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User } = require("../models/user");
const { authMiddleware, isSuperAdmin } = require("../middleware/auth");
const sendInviteEmail = require("../utils/sendInviteEmail");

// ==========================
// SUPER ADMIN LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "superadmin" });
    if (!user) {
      return res.status(400).json({ success: false, message: "Super Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET ALL ADMINS
// ==========================
router.get("/admins", authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password -otp -resetOtp -inviteToken");
    res.status(200).json({ success: true, count: admins.length, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// INVITE NEW ADMIN
// ==========================
router.post("/invite-admin", authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const { email } = req.body;

    // Already exists check
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.role !== "user") {
      return res.status(400).json({ success: false, message: "This email is already an admin or superadmin" });
    }

    // Invite token generate করো
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (existingUser) {
      // Already a user — upgrade to admin
      existingUser.inviteToken = inviteToken;
      existingUser.inviteTokenExpiry = inviteTokenExpiry;
      await existingUser.save();
    } else {
      // নতুন user তৈরি করো (pending admin)
      const newUser = new User({
        name: "",
        email,
        password: "",
        role: "admin",
        isVerified: false,
        inviteToken,
        inviteTokenExpiry,
      });
      await newUser.save();
    }

    // Invite email পাঠাও
    const inviteLink = `${process.env.SUPER_ADMIN_FRONTEND_URL}/admin-setup?token=${inviteToken}&email=${email}`;
    await sendInviteEmail(email, inviteLink);

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// ADMIN SETUP (নাম + password set করবে)
// ==========================
router.post("/admin-setup", async (req, res) => {
  try {
    const { email, token, name, password } = req.body;

    const user = await User.findOne({ email, inviteToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired invite link" });
    }

    if (new Date() > user.inviteTokenExpiry) {
      return res.status(400).json({ success: false, message: "Invite link has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.name = name;
    user.password = hashedPassword;
    user.role = "admin";
    user.isAdmin = true; // পুরনো admin dashboard এর জন্য
    user.isVerified = true;
    user.inviteToken = null;
    user.inviteTokenExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Admin account setup complete! You can now login.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// DELETE ADMIN
// ==========================
router.delete("/admin/:id", authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Admin কে user বানাও (delete না করে)
    admin.role = "user";
    admin.isAdmin = false;
    await admin.save();

    res.status(200).json({ success: true, message: "Admin removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// SUPER ADMIN STATS
// ==========================
router.get("/stats", authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalUsers = await User.countDocuments({ role: "user" });
    const pendingAdmins = await User.countDocuments({ role: "admin", isVerified: false });

    res.status(200).json({
      success: true,
      stats: { totalAdmins, totalUsers, pendingAdmins },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;