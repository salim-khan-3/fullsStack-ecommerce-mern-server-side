const { SubCat } = require("../models/subCat");
const express = require("express");
const Category = require("../models/category")
const router = express.Router();

// GET all subCategories
router.get("/", async (req, res) => {
  try {
    const subCatList = await SubCat.find().populate("category");

    if (!subCatList) {
      return res.status(500).json({ success: false });
    }

    return res.status(200).json(subCatList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET single subCategory by ID
router.get("/:id", async (req, res) => {
  try {
    const subCat = await SubCat.findById(req.params.id);

    if (!subCat) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subCat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



// CREATE subCategory
// router.post("/create", async (req, res) => {
//   try {
//     // category name দিয়ে category খুঁজে বের করা
//     const category = await Category.findOne({ name: req.body.category });

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     let subCat = new SubCat({
//       category: category._id,
//       subCat: req.body.subCat,
//     });

//     subCat = await subCat.save();

//     // populate করে category এর পুরো info সহ return করা
//     const populatedSubCat = await SubCat.findById(subCat._id).populate("category");

//     res.status(201).json(populatedSubCat);
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//       success: false,
//     });
//   }
// });
// CREATE subCategory
router.post("/create", async (req, res) => {
  try {
    let subCat = new SubCat({
      category: req.body.category, // সরাসরি _id save করো
      subCat: req.body.subCat,
    });

    subCat = await subCat.save();

    const populatedSubCat = await SubCat.findById(subCat._id).populate("category");

    res.status(201).json(populatedSubCat);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      success: false,
    });
  }
});
// DELETE subCategory by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedSubCat = await SubCat.findByIdAndDelete(req.params.id);

    if (!deletedSubCat) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SubCategory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE subCategory by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedSubCat = await SubCat.findByIdAndUpdate(
      req.params.id,
      {
        category: req.body.category,
        subCat: req.body.subCat,
      },
      { returnDocument: "after" }
    );

    if (!updatedSubCat) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSubCat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;