const express = require("express");
const router = express.Router();
const { MyList } = require("../models/myList");
const {authMiddleware} = require("../middleware/auth");

// ==========================
// GET MY LIST BY USER
// ==========================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const myList = await MyList.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: myList.length,
      myList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// ADD TO MY LIST
// ==========================
router.post("/add", authMiddleware, async (req, res) => {
  try {
    // duplicate check
    const existing = await MyList.findOne({
      productId: req.body.productId,
      userId: req.user.id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Product already in your list",
      });
    }

    const item = new MyList({
      productTitle: req.body.productTitle,
      images:       req.body.images,
      rating:       req.body.rating,
      price:        req.body.price,
      productId:    req.body.productId,
      userId:       req.user.id,
    });

    const saved = await item.save();

    res.status(201).json({
      success: true,
      message: "Added to my list",
      myList: saved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// REMOVE FROM MY LIST
// ==========================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await MyList.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, message: "Removed from my list" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;