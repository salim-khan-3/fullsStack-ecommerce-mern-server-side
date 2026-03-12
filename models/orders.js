const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productTitle: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  countInStock: { type: Number, required: true },
  subTotal: { type: Number, required: true }, // price * quantity
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String, default: "" },
  country: { type: String, required: true },
  street1: { type: String, required: true },
  street2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  notes: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,

    // Payment
    paymentMethod: {
      type: String,
      required: true,
      enum: ["bank", "cod", "sslcommerz"],
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "failed", "refunded"],
    },
    paidAt: { type: Date },
    transactionId: { type: String, default: "" }, // SSLCommerz transaction id

    // Shipping
    shippingMethod: { type: String, required: true, enum: ["flat", "pickup"] },
    shippingCost: { type: Number, required: true, default: 0 },

    // Pricing
    subTotal: { type: Number, required: true }, // sum of all orderItems subTotal
    totalPrice: { type: Number, required: true }, // subTotal + shippingCost

    // Order Status
    orderStatus: {
      type: String,
      default: "processing",
      enum: ["processing", "confirmed", "shipped", "delivered", "cancelled"],
    },

    deliveredAt: { type: Date },
  },
  { timestamps: true }, // createdAt, updatedAt auto
);

const Order = mongoose.model("Order", orderSchema);
module.exports = { Order };
