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

// Dashboard stats route (MUST be before /:id)
router.get("/stats/dashboard", getDashboardStats);

// Public: anyone can view products
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected: only authenticated users can create/update/delete
router.post("/", protect, upload.single("productImage"), createProduct);
router.put("/:id", protect, upload.single("productImage"), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;