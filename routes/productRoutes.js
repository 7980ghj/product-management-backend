const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getDashboardStats,
} = require("../controllers/productController");

// All routes require authentication
router.get("/stats/dashboard", protect, getDashboardStats);

router.route("/")
  .get(protect, getAllProducts)
  .post(protect, upload.single("productImage"), createProduct);

router.route("/:id")
  .get(protect, getProductById)
  .put(protect, upload.single("productImage"), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;