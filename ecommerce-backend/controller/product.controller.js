import mongoose from "mongoose";
import Product from "../model/product.model.js";
import crypto from "crypto";
import {
  getVersionedKey,
  invalidateProductCache,
  CACHE_TTL,
} from "../utils/productCache.js";
import { getRedisClient } from "../config/redis.js";

const hashQuery = (query) =>
  crypto.createHash("md5").update(JSON.stringify(query)).digest("hex");

/* ---------------- CREATE ---------------- */
export const createProduct = async (req, res) => {
  try {
    const { name, description, costPrice, salePrice, category } = req.body;

    if (!name || !description || !costPrice || !salePrice || !category) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const createdProduct = await Product.create({
      ...req.body,
      sellerId: req.user.id,
    });

    await invalidateProductCache();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: createdProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};

/* ---------------- SEARCH ---------------- */
export const searchProducts = async (req, res) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const totalCount = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      source: "db",
      products,
      totalPages,
      totalCount,
      page: Number(page),
    });
  } catch (error) {
    res.status(500).json({
      message: "Product search failed",
      error: error.message,
    });
  }
};

/* ---------------- GET ALL ---------------- */
export const getProducts = async (req, res) => {
  try {
    const redis = await getRedisClient();
    let cacheKey = "products:all";

    if (redis) {
      cacheKey = await getVersionedKey(cacheKey);
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          source: "cache",
          products: JSON.parse(cached),
        });
      }
    }

    const products = await Product.find().sort({ createdAt: -1 }).lean();

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(products), { EX: CACHE_TTL });
    }

    res.json({ success: true, source: "db", products });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

/* ---------------- GET BY ID ---------------- */
export const getProductById = async (req, res) => {
  try {
    const redis = await getRedisClient();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let cacheKey = `product:${id}`;

    if (redis) {
      cacheKey = await getVersionedKey(cacheKey);
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          source: "cache",
          product: JSON.parse(cached),
        });
      }
    }

    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(product), { EX: CACHE_TTL });
    }

    res.json({ success: true, source: "db", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

/* ---------------- UPDATE ---------------- */
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

    if (!updated) return res.status(404).json({ message: "Product not found" });

    await invalidateProductCache();

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    await invalidateProductCache();

    res.json({
      success: true,
      message: "Product deleted successfully",
      product: deleted,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};
