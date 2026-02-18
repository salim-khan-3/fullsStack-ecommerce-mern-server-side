const Category = require("../models/category.js");
const Product = require("../models/products.js");
const express = require("express");
const router = express.Router();

// get all products from database
router.get("/", async (req,res)=>{
    const productList = await Product.find().populate("category");
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList);
})

// Create Product
router.post("/create", async (req,res)=> {
    try {
        const category = await Category.findById(req.body.category);

        if(!category) {
            return res.status(400).json({message: "Invalid Category"});
        }

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: category._id,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        });

        product = await product.save();

        res.status(201).json(product);

    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        });
    }
});

module.exports = router;