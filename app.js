const fs = require("fs");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// uploads ফোল্ডার চেক করা
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

app.use(cors());

// --- এখানে পরিবর্তনগুলো করা হয়েছে ---
// ৪-৫টি হাই-কোয়ালিটি ইমেজের জন্য লিমিট ৫০ মেগাবাইট করে দেওয়া হলো
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

app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/subCategory", subCategoryRoutes);
app.use("/api/productWeight", productWeightRoutes);
app.use("/api/productSize", productSizeRoutes);
app.use("/api/productRams", productRamsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/user", userRoutes);

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





















// const fs = require("fs"); // এটি যোগ করুন
// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// // uploads ফোল্ডার চেক করা
// if (!fs.existsSync("./uploads")) {
//     fs.mkdirSync("./uploads");
// }

// app.use(cors());
// app.use(express.json());

// // Routes
// const categoryRoutes = require("./routes/category");
// const productRoutes = require("./routes/products")
// app.use("/api/category", categoryRoutes);
// app.use("/api/products", productRoutes);
// app.use("/uploads", express.static("uploads"));

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












  
// const fs = require("fs"); // এটি যোগ করুন
// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// // uploads ফোল্ডার চেক করা
// if (!fs.existsSync("./uploads")) {
//     fs.mkdirSync("./uploads");
// }

// app.use(cors());
// app.use(express.json());

// // Routes
// const categoryRoutes = require("./routes/category");
// const productRoutes = require("./routes/products")
// app.use("/api/category", categoryRoutes);
// app.use("/api/products", productRoutes);
// app.use("/uploads", express.static("uploads"));

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



















// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const cors = require("cors");

// require("dotenv/config");

// app.use(cors());
// app.options(".", cors());

// // middleware
// app.use(bodyParser.json());

// // Routes 
// const categoryRoutes = require("./routes/category")

// app.use("/api/category",categoryRoutes)

// // Database 
// mongoose
//   .connect(process.env.CONNECTION_STRING)  // options removed
//   .then(() => {
//     console.log("Database connection is ready...");

//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running http://localhost:${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });
