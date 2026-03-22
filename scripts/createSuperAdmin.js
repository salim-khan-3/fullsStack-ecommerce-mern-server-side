// scripts/createSuperAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("../models/user");

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("✅ Database connected...");

    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      console.log("⚠️  Super Admin already exists:", existing.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

    const superAdmin = new User({
      name: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      phone: "",
      password: hashedPassword,
      role: "superadmin",
      isAdmin: false,
      isVerified: true,
    });

    await superAdmin.save();
    console.log("✅ Super Admin created successfully!");
    console.log("📧 Email:", process.env.SUPER_ADMIN_EMAIL);
    console.log("🔑 Password:", process.env.SUPER_ADMIN_PASSWORD);
    console.log("⚠️  Please keep these credentials safe!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();