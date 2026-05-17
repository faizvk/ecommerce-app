/**
 * Seed Products Script (DESTRUCTIVE)
 * ──────────────────────────────────────────────────────────────
 * Wipes the products collection and inserts 30 products per category
 * across the canonical 7 categories (210 total).
 *
 * For a non-destructive top-up that migrates legacy categories instead
 * of wiping, run scripts/seedProductsExtend.js.
 *
 * Usage:  node scripts/seedProducts.js
 */

import mongoose from "mongoose";
import Product from "../model/product.model.js";
import User from "../model/user.model.js";
import { invalidateProductCache } from "../utils/productCache.js";
import { loadEnv, buildImagesFor, CATALOGS } from "./seedData.js";

loadEnv();

function buildDocs(catalog, category, sellerId) {
  return catalog.map((row, i) => {
    const [name, description, costPrice, salePrice] = row;
    return {
      sellerId,
      name,
      description,
      costPrice,
      salePrice,
      category,
      stock: 8 + Math.floor(Math.random() * 90),
      image: buildImagesFor(category, i, name),
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

async function run() {
  const uri = process.env.MONGOOSE_URI;
  if (!uri) {
    console.error("✗ MONGOOSE_URI is not set in .env");
    process.exit(1);
  }

  console.log("→ Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✓ Connected");

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("✗ No admin user found. Create at least one admin first.");
    process.exit(1);
  }
  console.log(`✓ Using admin: ${admin.email}`);

  const delResult = await Product.deleteMany({});
  console.log(`✓ Removed ${delResult.deletedCount} existing products`);

  const docs = Object.entries(CATALOGS).flatMap(([category, catalog]) =>
    buildDocs(catalog, category, admin._id)
  );

  const result = await Product.collection.insertMany(docs);
  console.log(`✓ Inserted ${result.insertedCount} products`);

  try {
    await invalidateProductCache();
    console.log("✓ Product cache invalidated");
  } catch {
    console.log("⚠ Cache invalidation skipped (Redis unavailable)");
  }

  const counts = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  console.log("\n📦 Product counts by category:");
  counts.forEach(({ _id, count }) => console.log(`   ${_id.padEnd(20)} ${count}`));

  await mongoose.disconnect();
  console.log("\n✓ Done. Disconnected.");
}

run().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
