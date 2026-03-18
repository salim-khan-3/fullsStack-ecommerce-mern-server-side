const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

// Vercel-এর জন্য কন্ডিশনাল dotenv
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}

// CORS কনফিগারেশন
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes Import
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
const bannerRoutes = require("./routes/banners");

// API Endpoints
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/subCategory", subCategoryRoutes);
app.use("/api/productWeight", productWeightRoutes);
app.use("/api/productSize", productSizeRoutes);
app.use("/api/productRams", productRamsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/myList", myListRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/banners", bannerRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

// Database connection
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB...", err));

// Vercel handles server, only listen locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
}

module.exports = app;










// const fs = require("fs");
// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();


// if (!fs.existsSync("./uploads")) {
//     fs.mkdirSync("./uploads");
// }

// // app.use(cors());
// app.use(cors({
//   origin: ["http://localhost:5173", "http://localhost:5174"],
//   credentials: true,
// }));

// app.use(express.json({ limit: '50mb' })); 
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// // ----------------------------------

// // Routes
// const categoryRoutes = require("./routes/category");
// const productRoutes = require("./routes/products");
// const subCategoryRoutes = require("./routes/subCategory");
// const productWeightRoutes = require("./routes/productWeight");
// const productSizeRoutes = require("./routes/productSize");
// const productRamsRoutes = require("./routes/productRams");
// const userRoutes = require("./routes/user");
// const cartRoutes = require("./routes/cart");
// const reviewRoutes = require("./routes/productReviews");
// const myListRoutes = require("./routes/myList");
// const orderRoutes = require("./routes/orders");
// const paymentRoutes = require("./routes/payment");
// const bannerRoutes = require("./routes/banners");


// app.use("/api/category", categoryRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/subCategory", subCategoryRoutes);
// app.use("/api/productWeight", productWeightRoutes);
// app.use("/api/productSize", productSizeRoutes);
// app.use("/api/productRams", productRamsRoutes);
// app.use("/uploads", express.static("uploads"));
// app.use("/api/user", userRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/myList", myListRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api/banners", bannerRoutes);

// // Database connection
// mongoose
//   .connect(process.env.CONNECTION_STRING)
//   .then(() => {
//     console.log("Database connection is ready...");

//     app.listen(process.env.PORT || 5000, () => {
//       console.log(`Server is running on port ${process.env.PORT || 5000}`);
//     });
//   })
//   .catch((err) => {
//     console.log("Database connection error:", err);
//   });


// module.exports = app;





















