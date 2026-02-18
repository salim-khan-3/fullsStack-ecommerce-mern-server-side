const Category = require("../models/category.js");
const Product = require("../models/products.js");
const express = require("express");
const router = express.Router();
const pLimit = require("p-limit").default;
const cloudinary = require("cloudinary").v2;

// get all products from database
router.get("/", async (req, res) => {
  const productList = await Product.find().populate("category");
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// Create Product
router.post("/create", async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);

    if (!category) {
      return res.status(400).json({ message: "Invalid Category" });
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

    let product = new Product({
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
    });

    product = await product.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      success: false,
    });
  }
});


router.delete("/:id",async(req,res)=>{
    const deleteProduct = await Product.findByIdAndDelete(req.params.id);
    if(!deleteProduct){
        return res.status(404).json({
            message:"Product not found",
            success:false
        })
    }
    res.json({
        message:"Product deleted successfully",
        success:true
    })
})

module.exports = router;



