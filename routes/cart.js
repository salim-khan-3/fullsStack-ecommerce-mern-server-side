const express = require("express");
const router = express.Router();
const { Cart } = require("../models/cart");
// const authMiddleware = require("../middleware/auth");
const { authMiddleware } = require("../middleware/auth");

// ==========================
// GET CART BY USER ID
// ==========================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cartList = await Cart.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      count: cartList.length,
      cart: cartList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// ADD TO CART
// ==========================
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productTitle, images, rating, price, quantity, countInStock, productId } = req.body;

    const cartItem = new Cart({
      productTitle,
      images,
      rating,
      price,
      quantity,
      subTotal: price * quantity,
      countInStock,           
      productId,
      userId: req.user.id,
    });

    const savedCart = await cartItem.save();

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cart: savedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ==========================
// CLEAR ALL ITEMS FROM CART BY USER ID
// ==========================
router.delete("/clear-cart/all", authMiddleware, async (req, res) => {
  try {
    // ডিলিট করার সময় নির্দিষ্ট ইউজারের ID ধরে ডিলিট করবে যাতে অন্য কারো কার্ট ডিলিট না হয়
    const result = await Cart.deleteMany({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// REMOVE FROM CART
// ==========================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// UPDATE CART ITEM
// ==========================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { quantity, price } = req.body;

    const updatedCart = await Cart.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        quantity,
        price,
        subTotal: price * quantity,
      },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      cart: updatedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;













// const express = require("express");
// const router = express.Router();
// const { Cart } = require("../models/cart");
// const authMiddleware = require("../middleware/auth");

// // ==========================
// // GET CART BY USER ID
// // ==========================
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const cartList = await Cart.find({ userId: req.user.id });

//     res.status(200).json({
//       success: true,
//       count: cartList.length,
//       cart: cartList,
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ==========================
// // ADD TO CART
// // ==========================
// router.post("/add", authMiddleware, async (req, res) => {
//   try {
//     const { productTitle, images, rating, price, quantity, productId } = req.body;

//     const cartItem = new Cart({
//       productTitle,
//       images,
//       rating,
//       price,
//       quantity,
//       subTotal: price * quantity,
//       productId,
//       userId: req.user.id,
//     });

//     const savedCart = await cartItem.save();

//     res.status(201).json({
//       success: true,
//       message: "Item added to cart",
//       cart: savedCart,
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });



// // ==========================
// // REMOVE FROM CART
// // ==========================
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const cartItem = await Cart.findOneAndDelete({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!cartItem) {
//       return res.status(404).json({ success: false, message: "Cart item not found" });
//     }

//     res.status(200).json({ success: true, message: "Item removed from cart" });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// // ```

// // ---

// // **Note:**
// // - `findOneAndDelete({ _id, userId })` — শুধু নিজের cart item delete করতে পারবে
// // - অন্যের cart item এর id দিলে `404` আসবে

// // ---

// // **Postman এ test করো:**
// // ```
// // DELETE http://localhost:4000/api/cart/69afa287ff41f5310990f684
// // Authorization: Bearer <token>
// // ```

// // ---

// // **Commit message:**
// // ```


// // ==========================
// // UPDATE CART ITEM
// // ==========================
// router.put("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { quantity, price } = req.body;

//     const updatedCart = await Cart.findOneAndUpdate(
//       { _id: req.params.id, userId: req.user.id },
//       {
//         quantity,
//         price,
//         subTotal: price * quantity,
//       },
//       { new: true }
//     );

//     if (!updatedCart) {
//       return res.status(404).json({ success: false, message: "Cart item not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Cart item updated",
//       cart: updatedCart,
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;

