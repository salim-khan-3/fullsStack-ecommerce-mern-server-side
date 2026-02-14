const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv/config");

app.use(cors());
app.options(".", cors());

// middleware
app.use(bodyParser.json());

// Routes 
const categoryRoutes = require("./routes/category")

app.use("/api/category",categoryRoutes)

// Database 
mongoose
  .connect(process.env.CONNECTION_STRING)  // options removed
  .then(() => {
    console.log("Database connection is ready...");

    app.listen(process.env.PORT, () => {
      console.log(`Server is running http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
