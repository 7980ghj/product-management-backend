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
router.route("/")
  .get(getAllProducts)
  .post(upload.single("productImage"), createProduct);

router.route("/:id")
  .get(getProductById)
  .put(upload.single("productImage"), updateProduct)
  .delete(deleteProduct);

module.exports = router;