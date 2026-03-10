const {User} = require("../models/user")
const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// ==========================
// REGISTER / SIGN UP
// ==========================
router.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // email already exists কিনা check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // token generate
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
      },
    });

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

    // user exists কিনা check
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // password match করে কিনা check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // token generate
    const token = jwt.sign(
      { id: user._id },
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
        phone: user.phone,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET ALL USERS
// ==========================
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ==========================
// GET USER COUNT
// ==========================
router.get("/get/count", async (req, res) => {
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
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ==========================
// DELETE USER BY ID
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ==========================
// UPDATE USER BY ID
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // password update হলে hash করো
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
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;