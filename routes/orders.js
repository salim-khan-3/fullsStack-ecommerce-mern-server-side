const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const Category = require("../models/category");
const { SubCat: SubCategory } = require("../models/subCat");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const pLimit = require("p-limit").default;

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==========================
// GET ALL PRODUCTS (with search & filters)
// ==========================
router.get("/", async (req, res) => {
  try {
    const page    = parseInt(req.query.page)  || 1;
    const perPage = parseInt(req.query.limit) || 12;

    const { search, category, subCat, brand, location } = req.query;

    // ── Build filter ──
    const filter = {};

    // 1. search — product name বা brand এ regex match
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      // category name দিয়ে search করতে category _id বের করো
      const matchedCategories = await Category.find({ name: regex }).select("_id");
      const matchedSubCats    = await SubCategory.find({ subCat: regex }).select("_id");

      const catIds    = matchedCategories.map((c) => c._id);
      const subCatIds = matchedSubCats.map((s) => s._id);

      filter.$or = [
        { name:  regex },
        { brand: regex },
        ...(catIds.length    > 0 ? [{ category: { $in: catIds    } }] : []),
        ...(subCatIds.length > 0 ? [{ subCat:   { $in: subCatIds } }] : []),
      ];
    }

    // 2. category filter (category page থেকে আসলে)
    if (category) filter.category = category;

    // 3. subCat filter
    if (subCat) filter.subCat = subCat;

    // 4. brand filter
    if (brand && brand.trim()) filter.brand = new RegExp(brand.trim(), "i");

    // 5. location filter
    if (location && location.trim()) filter.location = new RegExp(location.trim(), "i");

    // ── Count & paginate ──
    const totalProducts = await Product.countDocuments(filter);
    const totalPages    = Math.ceil(totalProducts / perPage) || 1;

    const products = await Product.find(filter)
      .populate("category")
      .populate("subCat")
      .populate("productRam")
      .populate("productSize")
      .populate("productWeight")
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json({
      products,
      totalPages,
      currentPage: page,
      totalItems: totalProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET FEATURED PRODUCTS
// ==========================
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate("category")
      .populate("subCat");
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET NEW/LATEST PRODUCTS
// ==========================
router.get("/new", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find()
      .populate("category")
      .populate("subCat")
      .populate("productRam")
      .populate("productSize")
      .populate("productWeight")
      .sort({ dateCreated: -1 })
      .limit(limit);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET POPULAR PRODUCTS
// ==========================
router.get("/popular", async (req, res) => {
  try {
    const products = await Product.find({
      rating: { $gte: 4 },
      countInStock: { $gt: 0 },
    })
      .sort({ rating: -1 })
      .limit(10);
    res.json({ success: true, products });
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
        const result = await cloudinary.uploader.upload(base64, { folder: "ecommerce_products" });
        return { url: result.secure_url, public_id: result.public_id };
      })
    );
    const uploaded       = await Promise.all(uploadImages);
    const imageUrls      = uploaded.map((img) => img.url);
    const imagePublicIds = uploaded.map((img) => img.public_id);

    const product = new Product({
      name:          req.body.name,
      description:   req.body.description,
      images:        imageUrls,
      imagePublicIds,
      brand:         req.body.brand || "",
      price:         Number(req.body.price),
      category:      req.body.category,
      subCat:        req.body.subCat        || undefined,
      oldPrice:      Number(req.body.oldPrice)  || 0,
      discount:      Number(req.body.discount)  || 0,
      productRam:    req.body.productRam    || undefined,
      productSize:   req.body.productSize   || undefined,
      productWeight: req.body.productWeight || undefined,
      countInStock:  Number(req.body.countInStock),
      rating:        Number(req.body.rating) || 0,
      isFeatured:    req.body.isFeatured === "true",
      location:      req.body.location || "dhaka",
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
    const products = await Product.find({ category: req.params.categoryId }).populate("category");
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET PRODUCT BY ID
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("subCat")
      .populate("productRam")
      .populate("productSize")
      .populate("productWeight");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// DELETE PRODUCT
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false });
    }
    if (product.imagePublicIds?.length > 0) {
      await Promise.all(product.imagePublicIds.map((id) => cloudinary.uploader.destroy(id)));
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
});

// ==========================
// UPDATE PRODUCT
// ==========================
router.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let imageUrls      = [];
    let imagePublicIds = [];

    if (req.body.existingImages) {
      const existing = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
      imageUrls = [...existing];
    }

    if (req.files?.length > 0) {
      const limit = pLimit(2);
      const uploaded = await Promise.all(
        req.files.map((file) =>
          limit(async () => {
            const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
            const result = await cloudinary.uploader.upload(base64, { folder: "ecommerce_products" });
            return { url: result.secure_url, public_id: result.public_id };
          })
        )
      );
      imageUrls      = [...imageUrls, ...uploaded.map((img) => img.url)];
      imagePublicIds = uploaded.map((img) => img.public_id);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name:          req.body.name,
        description:   req.body.description,
        brand:         req.body.brand,
        price:         Number(req.body.price),
        category:      req.body.category,
        subCat:        req.body.subCat        || undefined,
        oldPrice:      Number(req.body.oldPrice)  || 0,
        discount:      Number(req.body.discount)  || 0,
        productRam:    req.body.productRam    || undefined,
        productSize:   req.body.productSize   || undefined,
        productWeight: req.body.productWeight || undefined,
        countInStock:  Number(req.body.countInStock),
        rating:        Number(req.body.rating) || 0,
        isFeatured:    req.body.isFeatured === "true",
        location:      req.body.location || "dhaka",
        ...(imageUrls.length      > 0 && { images: imageUrls }),
        ...(imagePublicIds.length > 0 && { imagePublicIds }),
      },
      { new: true }
    );

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// ==========================
// GET REMAINING STOCK
// ==========================
router.get("/:id/remaining-stock", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { Order } = require("../models/order");

    const orderedAgg = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.productId": req.params.id,
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$orderItems.quantity" },
        },
      },
    ]);

    const alreadyOrdered = orderedAgg[0]?.total || 0;
    const remaining      = Math.max(0, product.countInStock - alreadyOrdered);

    res.json({
      success: true,
      productId:      product._id,
      countInStock:   product.countInStock,
      alreadyOrdered,
      remaining,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});











// const express = require("express");
// const router = express.Router();
// const { Order } = require("../models/order");
// const authMiddleware = require("../middleware/auth");

// // ==========================
// // POST — PLACE ORDER
// // ==========================
// router.post("/place", authMiddleware, async (req, res) => {
//   try {
//     const {
//       orderItems,
//       shippingAddress,
//       paymentMethod,
//       shippingMethod,
//       shippingCost,
//       subTotal,
//       totalPrice,
//     } = req.body;

//     if (!orderItems || orderItems.length === 0) {
//       return res.status(400).json({ success: false, message: "No order items" });
//     }

//     const order = new Order({
//       userId: req.user.id,
//       orderItems,
//       shippingAddress,
//       paymentMethod,
//       shippingMethod,
//       shippingCost,
//       subTotal,
//       totalPrice,
//       orderStatus: "processing",
//       paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
//     });

//     const saved = await order.save();

//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       order: saved,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // GET — MY ORDERS (logged in user)
// // ==========================
// router.get("/my-orders", authMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // GET — SINGLE ORDER BY ID
// // ==========================
// router.get("/:id", authMiddleware, async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.status(200).json({ success: true, order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // GET — ALL ORDERS (admin only)
// // ==========================
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     if (!req.user.isAdmin) {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     const orders = await Order.find()
//       .populate("userId", "name email")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // PUT — UPDATE ORDER STATUS (admin only)
// // ==========================
// router.put("/:id/status", authMiddleware, async (req, res) => {
//   try {
//     if (!req.user.isAdmin) {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     const { orderStatus } = req.body;

//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       {
//         orderStatus,
//         ...(orderStatus === "delivered" ? { deliveredAt: Date.now() } : {}),
//       },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.status(200).json({ success: true, message: "Status updated", order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // PUT — CANCEL ORDER (user)
// // ==========================
// router.put("/:id/cancel", authMiddleware, async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (["shipped", "delivered"].includes(order.orderStatus)) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot cancel order that is already shipped or delivered",
//       });
//     }

//     order.orderStatus = "cancelled";
//     await order.save();

//     res.status(200).json({ success: true, message: "Order cancelled", order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;