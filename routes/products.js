const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const Category = require("../models/category");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const pLimit = require("p-limit").default;

// ==========================
// Multer Memory Storage
// ==========================
const storage = multer.memoryStorage();
const upload = multer({ storage });



// ==========================
// GET ALL PRODUCTS
// ==========================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// ==========================
// CREATE PRODUCT
// ==========================
router.post("/create", upload.array("images", 10), async (req, res) => {
  try {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const limit = pLimit(2);

    const uploadImages = req.files.map((file) =>
      limit(async () => {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64, {
          folder: "ecommerce_products",
        });

        return {
          url: result.secure_url,
          public_id: result.public_id,
        };
      })
    );

    const uploaded = await Promise.all(uploadImages);

    const imageUrls = uploaded.map((img) => img.url);
    const imagePublicIds = uploaded.map((img) => img.public_id);

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      images: imageUrls,
      imagePublicIds: imagePublicIds,
      brand: req.body.brand || "",
      price: Number(req.body.price),
      category: req.body.category,
      countInStock: Number(req.body.countInStock),
      rating: Number(req.body.rating) || 0,
      isFeatured: req.body.isFeatured === "true",
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// ==========================
// FILTER BY CATEGORY
// ==========================
router.get("/category/:categoryId", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
    }).populate("category");

    res.json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



// ==========================
// GET PRODUCT BY ID
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



// ==========================
// DELETE PRODUCT
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // Cloudinary থেকে image delete করা
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      const deleteImages = product.imagePublicIds.map(async (publicId) => {
        await cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deleteImages);
    }

    // MongoDB থেকে product delete করা
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Server error while deleting product",
      success: false,
      error: error.message,
    });
  }
});

// ==========================
// UPDATE PRODUCT (Basic)
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;











// const category = require("../models/category.js");
// const Category = require("../models/category.js");
// const Product = require("../models/products.js");
// const express = require("express");
// const router = express.Router();
// const pLimit = require("p-limit").default;
// const cloudinary = require("cloudinary").v2;



// const multer = require("multer");
// const fs = require("fs");

// // Multer Config: ফাইল সাময়িকভাবে 'uploads' ফোল্ডারে সেভ হবে
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({ storage });



// // get all products from database
// router.get("/", async (req, res) => {
//   const productList = await Product.find().populate("category");
//   if (!productList) {
//     res.status(500).json({ success: false });
//   }
//   res.send(productList);
// });

// // ২. ক্রিয়েট প্রোডাক্ট (Multer middleware যোগ করা হয়েছে)
// router.post("/create", upload.array("images", 10), async (req, res) => {
//   try {
//     const categoryExists = await Category.findById(req.body.category);
//     if (!categoryExists) return res.status(400).json({ message: "Invalid Category" });

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No images uploaded" });
//     }

//     const limit = pLimit(2);
//     // req.files থেকে ফাইল পাথ নিয়ে ক্লাউডিনারিতে পাঠানো
//     const imagesToUpload = req.files.map((file) =>
//       limit(async () => {
//         const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
//         // আপলোড হয়ে গেলে লোকাল ফাইল ডিলিট করে দেওয়া (সার্ভার পরিষ্কার রাখা)
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//         return result.secure_url;
//       })
//     );

//     const imgUrls = await Promise.all(imagesToUpload);

//     let product = new Product({
//       name: req.body.name,
//       description: req.body.description,
//       images: imgUrls,
//       brand: req.body.brand || "",
//       price: Number(req.body.price),
//       category: req.body.category,
//       countInStock: Number(req.body.countInStock),
//       location: req.body.location,
//       rating: Number(req.body.rating) || 0,
//       isFeatured: req.body.isFeatured === "true", // FormData তে সব স্ট্রিং হিসেবে আসে
//     });

//     product = await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     // এরর হলে আপলোড হওয়া সাময়িক ফাইলগুলো ডিলিট করা
//     if (req.files) req.files.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
//     res.status(500).json({ error: err.message, success: false });
//   }
// });

// // Get Product by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).populate("category");

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//         success: false,
//       });
//     }

//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//       success: false,
//     });
//   }
// });

// // Delete Product
// router.delete("/:id", async (req, res) => {
//   const deleteProduct = await Product.findByIdAndDelete(req.params.id);

//   if (!deleteProduct) {
//     return res.status(404).json({
//       message: "Product not found",
//       success: false,
//     });
//   }
//   res.json({
//     message: "Product deleted successfully",
//     success: true,
//   });
// });

// //update product
// router.put("/:id", async (req, res) => {
//   const limit = pLimit(2);

//   if (!req.body.images || !Array.isArray(req.body.images)) {
//     return res.status(400).json({
//       error: "Images array is required",
//     });
//   }

//   const imagesToUpload = req.body.images.map((image) =>
//     limit(async () => {
//       const result = await cloudinary.uploader.upload(image);
//       return result;
//     }),
//   );

//   const uploadStatus = await Promise.all(imagesToUpload);
//   const imgurl = uploadStatus.map((item) => item.secure_url);
//   if (!uploadStatus) {
//     return res.status(500).json({
//       error: "images cannot be uploaded",
//       status: false,
//     });
//   }

//   const product = await Product.findByIdAndUpdate(
//     req.params.id,
//     {
//       name: req.body.name,
//       description: req.body.description,
//       images: imgurl,
//       brand: req.body.brand,
//       price: req.body.price,
//       category: category._id,
//       countInStock: req.body.countInStock,
//       rating: req.body.rating,
//       numReviews: req.body.numReviews,
//       isFeatured: req.body.isFeatured,
//     },
//     { new: true },
//   );
//   if (!product) {
//     return res.status(404).json({
//       message: "Product not found",
//       status: false,
//     });
//   }
//   res.json({
//     message: "Product updated successfully",
//     status: true,
//   });
// });

// // filter products by category
// // URL: /api/products/category/CATEGORY_ID
// router.get("/category/:categoryId", async (req, res) => {
//   try {
//     const { categoryId } = req.params;

//     const products = await Product.find({ category: categoryId })
//       .populate("category")
//       .sort({ createdAt: -1 });

//     if (!products || products.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি।",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: products.length,
//       data: products,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "সার্ভার এরর!",
//       error: error.message,
//     });
//   }
// });


// module.exports = router;
