
const sendResetOtpEmail = require("../utils/sendResetOtpEmail");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
// google_auth_route.js এর code paste করো
// const authMiddleware = require("../middleware/auth");
const { authMiddleware } = require("../middleware/auth");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const sendOtpEmail = require("../utils/sendOtpEmail");

// ==========================
// REGISTER / SIGN UP (OTP পাঠাবে, save করবে না এখনই)
// ==========================
router.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    // যদি user আছে কিন্তু verified না, আবার OTP পাঠাও
    if (existingUser && existingUser.isVerified) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser && !existingUser.isVerified) {
      // আগের unverified user আপডেট করো
      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      // নতুন user তৈরি করো
      const user = new User({
        name,
        phone,
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
      });
      await user.save();
    }

    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// VERIFY OTP
// ==========================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiry) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    // OTP সঠিক — verify করো এবং OTP clear করো
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// RESEND OTP
// ==========================
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtpEmail(email, otp);

    res
      .status(200)
      .json({ success: true, message: "New OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// SIGN IN / LOGIN
// ==========================
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    // signin route এ, isMatch check এর পরে যোগ করো:
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Please verify your email first" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin }, // ← isAdmin added
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        image: user.image || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET ALL USERS
// ==========================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET USER COUNT
// ==========================
router.get("/get/count", authMiddleware, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ success: true, userCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET USER BY ID
// ==========================
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// DELETE USER BY ID
// ==========================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// UPDATE USER BY ID
// ==========================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        email,
        ...(hashedPassword && { password: hashedPassword }),
      },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// ==========================
// UPLOAD PROFILE IMAGE
// ==========================
router.put(
  "/:id/image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image uploaded" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // পুরনো image Cloudinary থেকে delete করো
      if (user.imagePublicId) {
        await cloudinary.uploader.destroy(user.imagePublicId);
      }

      // নতুন image upload করো
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: "ecommerce_users",
      });

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { image: result.secure_url, imagePublicId: result.public_id },
        { new: true },
      ).select("-password");

      res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// ==========================
// FORGOT PASSWORD — OTP পাঠাও
// ==========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "No account found with this email" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Please verify your email first" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Reset OTP email পাঠাও
    await sendResetOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email.",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// VERIFY RESET OTP
// ==========================
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified. You can now reset your password.",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// RESET PASSWORD
// ==========================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now login.",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================
// GOOGLE LOGIN
// ==========================
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }

    // Google token verify করো
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // User already exists কিনা check করো
    let user = await User.findOne({ email });

    if (!user) {
      // নতুন user create করো
      user = new User({
        name,
        email,
        image: picture || "",
        password: googleId, // Google user এর জন্য random password
        phone: "",
        isAdmin: false,
      });
      await user.save();
    } else {
      // Existing user এর image update করো (Google picture দিয়ে)
      if (picture && !user.image) {
        user.image = picture;
        await user.save();
      }
    }

    // JWT token generate করো
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        phone:   user.phone,
        image:   user.image,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ success: false, message: "Google authentication failed" });
  }
});
module.exports = router;