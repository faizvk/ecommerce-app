import mongoose from "mongoose";
import Product from "../model/product.model.js";
import { redisClient } from "../config/redis.js";
import crypto from "crypto";

/* ----------------------------
   CONFIG
----------------------------- */
const CACHE_TTL = 300; // 5 minutes

const hashQuery = (query) =>
  crypto.createHash("md5").update(JSON.stringify(query)).digest("hex");

/* ----------------------------
   CREATE PRODUCT
----------------------------- */
export const createProduct = async (req, res) => {
  try {
    const { name, description, costPrice, salePrice, category } = req.body;

    if (!name || !description || !costPrice || !salePrice || !category) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const createdProduct = await Product.create({
      ...req.body,
      sellerId: req.user.id,
    });

    // Invalidate cache (dev-friendly approach)
    try {
      await redisClient.flushDb();
    } catch (_) {}

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: createdProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

/* ----------------------------
   SEARCH PRODUCTS
----------------------------- */
export const searchProducts = async (req, res) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const cacheKey = `products:search:${hashQuery(req.query)}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          source: "cache",
          products: JSON.parse(cached),
        });
      }
    } catch (_) {}

    let filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .lean();

    try {
      await redisClient.set(cacheKey, JSON.stringify(products), {
        EX: CACHE_TTL,
      });
    } catch (_) {}

    res.status(200).json({
      success: true,
      source: "db",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Product search failed",
      error: error.message,
    });
  }
};

/* ----------------------------
   PAGINATED PRODUCT LIST
----------------------------- */
export const getProducts = async (req, res) => {
  try {
    let { page = 1, limit = 20 } = req.query;

    page = Number(page);
    limit = Number(limit);

    const cacheKey = `products:page:${page}:limit:${limit}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          source: "cache",
          ...JSON.parse(cached),
        });
      }
    } catch (_) {}

    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Product.countDocuments();

    const response = {
      page,
      totalPages: Math.ceil(total / limit),
      products,
    };

    try {
      await redisClient.set(cacheKey, JSON.stringify(response), {
        EX: CACHE_TTL,
      });
    } catch (_) {}

    res.status(200).json({
      success: true,
      source: "db",
      ...response,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/* ----------------------------
   GET PRODUCT BY ID
----------------------------- */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const cacheKey = `product:${id}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          source: "cache",
          product: JSON.parse(cached),
        });
      }
    } catch (_) {}

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    try {
      await redisClient.set(cacheKey, JSON.stringify(product), {
        EX: CACHE_TTL,
      });
    } catch (_) {}

    res.status(200).json({
      success: true,
      source: "db",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

/* ----------------------------
   UPDATE PRODUCT
----------------------------- */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (req.body.stock !== undefined && req.body.stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Invalidate cache
    try {
      await redisClient.flushDb();
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

/* ----------------------------
   DELETE PRODUCT
----------------------------- */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Invalidate cache
    try {
      await redisClient.flushDb();
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product: deleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};
