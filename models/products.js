const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  imagePublicIds: [
    {
      type: String,
      required: true,
    },
  ],
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
  },
  oldPrice: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  productRam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductRamsSchema",
    },
  ],
  productSize: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductSizeSchema",
    },
  ],
  productWeight: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductWeight",
    },
  ],
  countInStock: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: "dhaka",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;