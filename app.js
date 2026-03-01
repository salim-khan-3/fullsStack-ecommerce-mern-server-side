
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Routes
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/products")
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static("uploads"));

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
