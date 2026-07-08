const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getDashboardStats,
} = require("../controllers/productController");

// Dashboard stats route (MUST be before /:id)
router.get("/stats/dashboard", getDashboardStats);

// Product CRUD routes
router.get("/", getAllProducts);

router.post("/", function(req, res, next) {
  upload.single("productImage")(req, res, function(err) {
    if (err) {
      console.error("MULTER/CLOUDINARY ERROR:", err.message);
      console.error("FULL UPLOAD ERROR:", err);
      return res.status(500).json({ success: false, message: "Image upload failed", error: err.message });
    }
    createProduct(req, res);
  });
});

router.route("/:id")
  .get(getProductById)
  .put(upload.single("productImage"), updateProduct)
  .delete(deleteProduct);

module.exports = router;