/**
 * Seed Products Extend Script (NON-DESTRUCTIVE)
 * ──────────────────────────────────────────────────────────────
 * Preserves existing products. In order:
 *
 *   1. MIGRATE legacy category keys onto the canonical set:
 *        "home appliances" → "home"
 *        "dairy"           → "grocery"
 *        "technology"      → "electronics"
 *
 *   2. TOP UP each canonical category to 30 products by inserting any
 *      items from CATALOGS whose `name` isn't already in the DB. This
 *      makes the script idempotent — running it twice doesn't duplicate
 *      anything.
 *
 * Use this when you want to keep your existing seeded products and just
 * surface 30+ items under each canonical category. For a clean wipe and
 * fresh seed instead, use scripts/seedProducts.js.
 *
 * Usage:  node scripts/seedProductsExtend.js
 */

import mongoose from "mongoose";
import Product from "../model/product.model.js";
import User from "../model/user.model.js";
import { invalidateProductCache } from "../utils/productCache.js";
import { loadEnv, buildImagesFor, CATALOGS } from "./seedData.js";

loadEnv();

const TARGET_PER_CATEGORY = 30;

const LEGACY_TO_CANONICAL = {
  "home appliances": "home",
  "dairy":           "grocery",
  "technology":      "electronics",
};

function buildDoc(category, index, sellerId, row) {
  const [name, description, costPrice, salePrice] = row;
  return {
    sellerId,
    name,
    description,
    costPrice,
    salePrice,
    category,
    stock: 8 + Math.floor(Math.random() * 90),
    image: buildImagesFor(category, index, name),
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function migrateLegacy() {
  let total = 0;
  for (const [from, to] of Object.entries(LEGACY_TO_CANONICAL)) {
    const result = await Product.updateMany({ category: from }, { $set: { category: to } });
    if (result.modifiedCount > 0) {
      console.log(`  • ${from.padEnd(18)} → ${to.padEnd(12)} (${result.modifiedCount} migrated)`);
      total += result.modifiedCount;
    }
  }
  if (total === 0) console.log("  • no legacy categories to migrate");
  return total;
}

async function topUpCategory(category, catalog, sellerId) {
  // Existing product names in this category — used to skip duplicates
  const existing = await Product.find({ category, deleted: false }, "name").lean();
  const existingNames = new Set(existing.map((p) => p.name));
  const currentCount = existing.length;

  if (currentCount >= TARGET_PER_CATEGORY) {
    console.log(`  • ${category.padEnd(12)} ${currentCount}/${TARGET_PER_CATEGORY} — already at target`);
    return 0;
  }

  const needed = TARGET_PER_CATEGORY - currentCount;
  const toInsert = [];
  for (let i = 0; i < catalog.length && toInsert.length < needed; i++) {
    const row = catalog[i];
    if (!existingNames.has(row[0])) {
      toInsert.push(buildDoc(category, i, sellerId, row));
    }
  }

  if (toInsert.length === 0) {
    console.log(`  • ${category.padEnd(12)} ${currentCount}/${TARGET_PER_CATEGORY} — no new catalog items available`);
    return 0;
  }

  await Product.collection.insertMany(toInsert);
  console.log(`  • ${category.padEnd(12)} ${currentCount} → ${currentCount + toInsert.length} (+${toInsert.length})`);
  return toInsert.length;
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

  console.log("\n→ Migrating legacy categories...");
  await migrateLegacy();

  console.log("\n→ Topping up each canonical category to 30...");
  let inserted = 0;
  for (const [category, catalog] of Object.entries(CATALOGS)) {
    inserted += await topUpCategory(category, catalog, admin._id);
  }

  if (inserted > 0) {
    try {
      await invalidateProductCache();
      console.log("\n✓ Product cache invalidated");
    } catch {
      console.log("\n⚠ Cache invalidation skipped (Redis unavailable)");
    }
  }

  const counts = await Product.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  console.log("\n📦 Final product counts by category:");
  counts.forEach(({ _id, count }) => console.log(`   ${_id.padEnd(20)} ${count}`));

  await mongoose.disconnect();
  console.log("\n✓ Done. Disconnected.");
}

run().catch((err) => {
  console.error("✗ Extend failed:", err);
  process.exit(1);
});
