const fs = require("fs");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

// app.use(cors());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ----------------------------------

// Routes
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/products");
const subCategoryRoutes = require("./routes/subCategory");
const productWeightRoutes = require("./routes/productWeight");
const productSizeRoutes = require("./routes/productSize");
const productRamsRoutes = require("./routes/productRams");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const reviewRoutes = require("./routes/productReviews");
const myListRoutes = require("./routes/myList");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");

app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/subCategory", subCategoryRoutes);
app.use("/api/productWeight", productWeightRoutes);
app.use("/api/productSize", productSizeRoutes);
app.use("/api/productRams", productRamsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/myList", myListRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Database connection
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database connection is ready...");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });
























