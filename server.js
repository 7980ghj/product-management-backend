const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();


// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://product-management-frontend-1f37.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve uploaded images as static files
app.use('/uploads', express.static('uploads'));
// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce Product Management API",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});