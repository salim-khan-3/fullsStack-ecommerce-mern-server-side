const category = require("../models/category.js");
const Category = require("../models/category.js");
const Product = require("../models/products.js");
const express = require("express");
const router = express.Router();
const pLimit = require("p-limit").default;
const cloudinary = require("cloudinary").v2;



const multer = require("multer");
const fs = require("fs");

// Multer Config: ফাইল সাময়িকভাবে 'uploads' ফোল্ডারে সেভ হবে
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });



// get all products from database
router.get("/", async (req, res) => {
  const productList = await Product.find().populate("category");
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// ২. ক্রিয়েট প্রোডাক্ট (Multer middleware যোগ করা হয়েছে)
router.post("/create", upload.array("images", 10), async (req, res) => {
  try {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) return res.status(400).json({ message: "Invalid Category" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const limit = pLimit(2);
    // req.files থেকে ফাইল পাথ নিয়ে ক্লাউডিনারিতে পাঠানো
    const imagesToUpload = req.files.map((file) =>
      limit(async () => {
        const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
        // আপলোড হয়ে গেলে লোকাল ফাইল ডিলিট করে দেওয়া (সার্ভার পরিষ্কার রাখা)
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return result.secure_url;
      })
    );

    const imgUrls = await Promise.all(imagesToUpload);

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      images: imgUrls,
      brand: req.body.brand || "",
      price: Number(req.body.price),
      category: req.body.category,
      countInStock: Number(req.body.countInStock),
      location: req.body.location,
      rating: Number(req.body.rating) || 0,
      isFeatured: req.body.isFeatured === "true", // FormData তে সব স্ট্রিং হিসেবে আসে
    });

    product = await product.save();
    res.status(201).json(product);
  } catch (err) {
    // এরর হলে আপলোড হওয়া সাময়িক ফাইলগুলো ডিলিট করা
    if (req.files) req.files.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
    res.status(500).json({ error: err.message, success: false });
  }
});

// Get Product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

// Delete Product
router.delete("/:id", async (req, res) => {
  const deleteProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deleteProduct) {
    return res.status(404).json({
      message: "Product not found",
      success: false,
    });
  }
  res.json({
    message: "Product deleted successfully",
    success: true,
  });
});

//update product
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

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      images: imgurl,
      brand: req.body.brand,
      price: req.body.price,
      category: category._id,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true },
  );
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      status: false,
    });
  }
  res.json({
    message: "Product updated successfully",
    status: true,
  });
});

module.exports = router;
