const express = require("express");
const router = express.Router();
const { ProductReviews } = require("../models/productReviews");

// ==========================
// GET ALL REVIEWS (filter by productId optional)
// ==========================
router.get("/", async (req, res) => {
  let reviews = [];

  try {
    if (
      req.query.productId !== undefined &&
      req.query.productId !== null &&
      req.query.productId !== ""
    ) {
      reviews = await ProductReviews.find({ productId: req.query.productId });
    } else {
      reviews = await ProductReviews.find();
    }

    if (!reviews) {
      return res.status(500).json({ success: false });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET REVIEW COUNT
// ==========================
router.get("/get/count", async (req, res) => {
  try {
    const reviewCount = await ProductReviews.countDocuments();
    res.status(200).json({ success: true, reviewCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET REVIEW BY ID
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const review = await ProductReviews.findById(req.params.id);

    if (!review) {
      return res.status(500).json({ message: "The review with the given ID was not found." });
    }

    return res.status(200).send(review);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// ADD REVIEW
// ==========================
router.post("/add", async (req, res) => {
  try {
    let review = new ProductReviews({
      customerId:     req.body.customerId,
      customerName:   req.body.customerName,
      review:         req.body.review,
      customerRating: req.body.customerRating,
      productId:      req.body.productId,
    });

    if (!review) {
      return res.status(500).json({
        error: "Review could not be created",
        success: false,
      });
    }

    review = await review.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;