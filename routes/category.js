const category = require("../models/category");
const Category = require("../models/category");
const express = require("express");
const router = express.Router();
const pLimit = require("p-limit").default;
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET_KEY,
});

// get all category
router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find(); // <-- capital C
    if (!categoryList) {
      return res.status(500).json({ success: false });
    }
    res.json(categoryList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single category by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check valid ID
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get Category Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE Category by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE category
router.post("/create", async (req, res) => {
  try {
    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({
        error: "Images array is required",
      });
    }

    const limit = pLimit(2);

    const imagesToUpload = req.body.images.map((image) =>
      limit(async () => {
        const result = await cloudinary.uploader.upload(image);
        return result;
      }),
    );

    const uploadStatus = await Promise.all(imagesToUpload);

    const imgurl = uploadStatus.map((item) => item.secure_url);

    let category = new Category({
      name: req.body.name,
      images: imgurl,
      color: req.body.color,
    });

    category = await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      success: false,
    });
  }
});

// UPDATE Category by ID
router.put("/:id", async (req, res) => {
  const limit = pLimit(2);

  if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({
        error: "Images array is required",
      });
    }

  const imagesToUpload = req.body.images.map((image) =>
    limit(async () => {
      const result = await cloudinary.uploader.upload(image);
      return result;
    }),
  );

  const uploadStatus = await Promise.all(imagesToUpload);
  const imgurl = uploadStatus.map((item) => item.secure_url);
  if (!uploadStatus) {
    return res.status(500).json({
      error: "images cannot be uploaded",
      status: false,
    });
  }
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      images: imgurl,
      color: req.body.color,
    },
     { returnDocument: "after" },
  );

  if (!category) {
    return res.status(500).json({
      message: "Category cannot be updated",
      success: false,
    });
  }

  res.send(category);
});

module.exports = router;
