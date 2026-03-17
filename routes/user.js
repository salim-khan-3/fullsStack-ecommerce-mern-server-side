// const {User} = require("../models/user")
// const express = require("express");
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const authMiddleware = require('../middleware/auth');

// // ==========================
// // REGISTER / SIGN UP
// // ==========================
// router.post("/signup", async (req, res) => {
//   try {
//     const { name, phone, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists with this email" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({
//       name,
//       phone,
//       email,
//       password: hashedPassword,
//     });

//     const savedUser = await user.save();

//     const token = jwt.sign(
//       { id: savedUser._id, isAdmin: savedUser.isAdmin },  // ← isAdmin added
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       token,
//       user: {
//         id: savedUser._id,
//         name: savedUser.name,
//         email: savedUser.email,
//         phone: savedUser.phone,
//         isAdmin: savedUser.isAdmin,
//       },
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // SIGN IN / LOGIN
// // ==========================
// router.post("/signin", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, isAdmin: user.isAdmin },  // ← isAdmin added
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         isAdmin: user.isAdmin,
//       },
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // GET ALL USERS
// // ==========================
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.status(200).json({ success: true, count: users.length, users });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // GET USER COUNT
// // ==========================
// router.get("/get/count", authMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     res.status(200).json({ success: true, userCount });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // GET USER BY ID
// // ==========================
// router.get("/:id", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // DELETE USER BY ID
// // ==========================
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
//     res.status(200).json({ success: true, message: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // UPDATE USER BY ID
// // ==========================
// router.put("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { name, phone, email, password } = req.body;

//     let hashedPassword;
//     if (password) {
//       hashedPassword = await bcrypt.hash(password, 10);
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         name,
//         phone,
//         email,
//         ...(hashedPassword && { password: hashedPassword }),
//       },
//       { new: true }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;

// const {User} = require("../models/user")
// const express = require("express");
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const authMiddleware = require('../middleware/auth');

// // ==========================
// // REGISTER / SIGN UP
// // ==========================
// router.post("/signup", async (req, res) => {
//   try {
//     const { name, phone, email, password } = req.body;

//     // email already exists কিনা check
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists with this email" });
//     }

//     // password hash
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({
//       name,
//       phone,
//       email,
//       password: hashedPassword,
//     });

//     const savedUser = await user.save();

//     // token generate
//     const token = jwt.sign(
//       { id: savedUser._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       token,
//       user: {
//         id: savedUser._id,
//         name: savedUser.name,
//         email: savedUser.email,
//         phone: savedUser.phone,
//       },
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // SIGN IN / LOGIN
// // ==========================
// router.post("/signin", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // user exists কিনা check
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: "User not found" });
//     }

//     // password match করে কিনা check
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: "Invalid credentials" });
//     }

//     // token generate
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       },
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // GET ALL USERS
// // ==========================
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");

//     res.status(200).json({
//       success: true,
//       count: users.length,
//       users,
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// // ==========================
// // GET USER COUNT
// // ==========================
// router.get("/get/count",authMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();

//     res.status(200).json({ success: true, userCount });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // GET USER BY ID
// // ==========================
// router.get("/:id",authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, user });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// // ==========================
// // DELETE USER BY ID
// // ==========================
// router.delete("/:id",authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, message: "User deleted successfully" });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // UPDATE USER BY ID
// // ==========================
// router.put("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { name, phone, email, password } = req.body;

//     // password update হলে hash করো
//     let hashedPassword;
//     if (password) {
//       hashedPassword = await bcrypt.hash(password, 10);
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         name,
//         phone,
//         email,
//         ...(hashedPassword && { password: hashedPassword }),
//       },
//       { new: true }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, user: updatedUser });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;

const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");
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
module.exports = router;