





const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const {authMiddleware} = require("../middleware/auth");

// ==========================
// POST — PLACE ORDER
// ==========================
router.post("/place", authMiddleware, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      shippingCost,
      subTotal,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    const order = new Order({
      userId: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      shippingCost,
      subTotal,
      totalPrice,
      orderStatus: "processing",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    });

    const saved = await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: saved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET — MY ORDERS (logged in user)
// ==========================
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET — SINGLE ORDER BY ID
// ==========================
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// GET — ALL ORDERS (admin only)
// ==========================
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// PUT — UPDATE ORDER STATUS (admin only)
// ==========================
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus,
        ...(orderStatus === "delivered" ? { deliveredAt: Date.now() } : {}),
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// PUT — CANCEL ORDER (user)
// ==========================
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order that is already shipped or delivered",
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;