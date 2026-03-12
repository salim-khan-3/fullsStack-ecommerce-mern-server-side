const express = require("express");
const router = express.Router();
const SSLCommerzPayment = require("sslcommerz-lts");
const { Order } = require("../models/order");
const authMiddleware = require("../middleware/auth");

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.IS_LIVE === "true";

// ==========================
// POST — INIT PAYMENT
// ==========================
router.post("/init", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const transactionId = `TXN-${orderId}-${Date.now()}`;

    const data = {
      total_amount:         order.totalPrice,
      currency:             "BDT",
      tran_id:              transactionId,
      success_url:          `${process.env.BACKEND_URL}/api/payment/success`,
      fail_url:             `${process.env.BACKEND_URL}/api/payment/fail`,
      cancel_url:           `${process.env.BACKEND_URL}/api/payment/cancel`,
      ipn_url:              `${process.env.BACKEND_URL}/api/payment/ipn`,
      shipping_method:      order.shippingMethod,
      product_name:         "Ecommerce Order",
      product_category:     "General",
      product_profile:      "general",
      cus_name:             `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      cus_email:            order.shippingAddress.email,
      cus_add1:             order.shippingAddress.street1,
      cus_add2:             order.shippingAddress.street2 || "",
      cus_city:             order.shippingAddress.city,
      cus_state:            order.shippingAddress.state,
      cus_postcode:         order.shippingAddress.zipCode,
      cus_country:          order.shippingAddress.country,
      cus_phone:            order.shippingAddress.phone,
      ship_name:            `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      ship_add1:            order.shippingAddress.street1,
      ship_city:            order.shippingAddress.city,
      ship_postcode:        order.shippingAddress.zipCode,
      ship_country:         order.shippingAddress.country,
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      // transaction id save করো order এ
      await Order.findByIdAndUpdate(orderId, { transactionId });

      return res.status(200).json({
        success: true,
        gatewayUrl: apiResponse.GatewayPageURL,
      });
    } else {
      return res.status(400).json({ success: false, message: "Payment init failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// POST — PAYMENT SUCCESS
// ==========================
router.post("/success", async (req, res) => {
  try {
    const { tran_id, val_id, status } = req.body;

    if (status !== "VALID") {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
    }

    // tran_id থেকে orderId বের করো — "TXN-orderId-timestamp"
    const orderId = tran_id.split("-")[1];

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      paidAt: Date.now(),
      orderStatus: "confirmed",
    });

    res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
  }
});

// ==========================
// POST — PAYMENT FAIL
// ==========================
router.post("/fail", async (req, res) => {
  try {
    const { tran_id } = req.body;
    const orderId = tran_id.split("-")[1];

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "failed",
      orderStatus: "cancelled",
    });

    res.redirect(`${process.env.FRONTEND_URL}/payment/fail?orderId=${orderId}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
  }
});

// ==========================
// POST — PAYMENT CANCEL
// ==========================
router.post("/cancel", async (req, res) => {
  try {
    const { tran_id } = req.body;
    const orderId = tran_id.split("-")[1];

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "pending",
      orderStatus: "cancelled",
    });

    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel?orderId=${orderId}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
  }
});

module.exports = router;