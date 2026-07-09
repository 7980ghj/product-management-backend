const Product = require("../models/Product");

// @desc    Create a new product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { productName, category, brand, price, discountPercentage, stockQuantity, description, status } = req.body;

    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    if (!productName || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide product name, category, and price",
      });
    }



const productData = {
  productName,
  category,
  brand: brand || "Unbranded",
  price: Number(price),
  discountPercentage: Number(discountPercentage) || 0,
  stockQuantity: Number(stockQuantity) || 0,
  description: description || "",
  productImage: req.file
    ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
    : "",
  status: status || "Active",
};

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { search, category, status, sortBy, sortOrder, page, limit } = req.query;

    let filter = {};

    if (search) {
      filter.productName = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      productName,
      category,
      brand,
      price,
      discountPercentage,
      stockQuantity,
      description,
      status,
    } = req.body;

    const updateData = {};

    if (productName) updateData.productName = productName;
    if (category) updateData.category = category;
    if (brand) updateData.brand = brand;
    if (price) updateData.price = Number(price);
    if (discountPercentage !== undefined)
      updateData.discountPercentage = Number(discountPercentage);
    if (stockQuantity !== undefined)
      updateData.stockQuantity = Number(stockQuantity);
    if (description !== undefined)
      updateData.description = description;
    if (status) updateData.status = status;

    // Update image if uploaded
    if (req.file) {
      updateData.productImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // Recalculate final price
    const finalPrice = updateData.price || product.price;
    const finalDiscount =
      updateData.discountPercentage !== undefined
        ? updateData.discountPercentage
        : product.discountPercentage;

    updateData.finalPrice =
      Math.round(
        (finalPrice - (finalPrice * finalDiscount) / 100) * 100
      ) / 100;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/products/stats/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: "Active" });
    const inactiveProducts = await Product.countDocuments({ status: "Inactive" });

    const categories = await Product.distinct("category");
    const totalCategories = categories.length;

    let totalStock = 0;
    const products = await Product.find({}, { stockQuantity: 1 });
    products.forEach((p) => {
      totalStock += p.stockQuantity || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        totalCategories,
        totalStock,
        categories,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getDashboardStats,
};