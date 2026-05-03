import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../config/env.js";
import Product from "../model/product.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../middleware/AppError.js";
import { ERROR_CODES } from "../constants/index.js";
import logger from "../config/logger.js";

// Single-provider for now: Groq powers both chat and structured search-translate
// (via response_format: { type: "json_object" }). Gemini was tried but the free
// key was rate-limited/revoked in practice, and consolidating providers cuts
// failure modes in half.
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// Categories mirror the product schema enum — kept in sync manually.
const CATEGORIES = ["electronics", "fashion", "dairy", "technology", "home appliances"];

// Cap conversation history sent to the model. Anything beyond this is dropped
// (the client keeps the full history for display, but we don't pay tokens for it).
const MAX_HISTORY_MESSAGES = 10;
const MAX_USER_MESSAGE_CHARS = 1000;
const CATALOG_CONTEXT_SIZE = 24;

/**
 * Build a compact catalog snapshot for the model's context. We pick a mix of
 * popular and budget-friendly products across categories so the assistant has
 * something concrete to recommend instead of hallucinating.
 */
async function getCatalogContext() {
  const products = await Product.find(
    { deleted: false, stock: { $gt: 0 } },
    "name salePrice category _id"
  )
    .sort({ salePrice: 1 })
    .limit(CATALOG_CONTEXT_SIZE)
    .lean();

  return products.map((p) => ({
    id: String(p._id),
    name: p.name,
    price: p.salePrice,
    category: p.category,
  }));
}

function buildSystemPrompt(catalog) {
  const catalogText = catalog
    .map((p) => `- ${p.name} (₹${p.price}, ${p.category}, id:${p.id})`)
    .join("\n");

  return `You are NexKart's friendly shopping assistant. Help shoppers find products, answer questions about orders/shipping/returns, and make the experience delightful.

Tone: warm, concise, helpful. Use ₹ for prices. Keep replies under 150 words unless the user asks for detail.

Categories available: ${CATEGORIES.join(", ")}.

Live product context (a sample of in-stock items, sorted by price):
${catalogText}

When recommending products, use this exact format so the UI can render clickable cards:
[product:<id>] Product name - ₹price

Example: "I'd suggest [product:65a1...] Wireless Earbuds - ₹999 — great battery life and within your budget."

Rules:
- Only recommend products from the live context above. Never invent products or IDs.
- If the user asks about something not in the catalog, say so politely and suggest related categories.
- For order/return/refund questions, point users to their Orders page (/orders) — don't guess specifics.
- Don't ask for personal info. Don't mention competitors.`;
}

/* ────────────────────────────────────────────────────────────
 * AI CHAT
 *
 * POST /api/ai/chat
 * Body: { messages: [{ role: "user" | "assistant", content: string }, ...] }
 * Returns: { reply: string, model: string }
 *
 * The user's most recent message is the last item in `messages`. We trim
 * history server-side to control token costs.
 * ─────────────────────────────────────────────────────────── */
export const chat = asyncHandler(async (req, res) => {
  if (!groq) {
    throw new AppError(503, ERROR_CODES.SERVICE_UNAVAILABLE, "AI assistant is not configured");
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, "messages must be a non-empty array");
  }

  // Validate + trim history
  const trimmed = messages.slice(-MAX_HISTORY_MESSAGES).map((m) => {
    if (!m || (m.role !== "user" && m.role !== "assistant")) {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, "Each message needs a role of 'user' or 'assistant'");
    }
    if (typeof m.content !== "string" || m.content.trim().length === 0) {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, "Each message needs non-empty string content");
    }
    return { role: m.role, content: m.content.slice(0, MAX_USER_MESSAGE_CHARS) };
  });

  const catalog = await getCatalogContext();

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: buildSystemPrompt(catalog) }, ...trimmed],
      temperature: 0.7,
      max_tokens: 400,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "Sorry, I'm having trouble responding right now.";

    res.json({
      success: true,
      data: {
        reply,
        model: completion.model,
      },
    });
  } catch (err) {
    logger.error({ err: err.message }, "groq chat completion failed");
    throw new AppError(502, ERROR_CODES.UPSTREAM_ERROR, "AI assistant is temporarily unavailable");
  }
});

/* ────────────────────────────────────────────────────────────
 * SEARCH TRANSLATE
 *
 * POST /api/ai/search-translate
 * Body: { query: "running shoes under 2000 with free delivery" }
 * Returns: { filters: { category?, priceMax?, priceMin?, sort?, keywords[] } }
 *
 * Converts a natural-language query into structured filters that the
 * frontend can apply directly. Uses Groq's JSON-mode for reliability.
 * ─────────────────────────────────────────────────────────── */
export const searchTranslate = asyncHandler(async (req, res) => {
  if (!groq) {
    throw new AppError(503, ERROR_CODES.SERVICE_UNAVAILABLE, "AI search is not configured");
  }

  const { query } = req.body || {};
  if (typeof query !== "string" || query.trim().length === 0) {
    throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, "query is required");
  }
  if (query.length > 200) {
    throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, "query is too long (max 200 chars)");
  }

  const systemPrompt = `You extract structured shopping filters from natural-language queries. Respond with ONLY a single JSON object — no prose, no markdown.

Available categories: ${CATEGORIES.join(", ")}
Available sorts: "price-asc", "price-desc", "newest", "rating"

Output schema (strict — every field must be present, use null when not inferred):
{
  "category": one of [${CATEGORIES.map((c) => `"${c}"`).join(", ")}] or null,
  "priceMax": number or null,
  "priceMin": number or null,
  "sort": one of ["price-asc", "price-desc", "newest", "rating"] or null,
  "keywords": [string, ...]  (3 max, lowercase, the user's actual product intent — exclude price/category words)
}

Examples:
"cheap headphones under 1500" → {"category":"electronics","priceMax":1500,"priceMin":null,"sort":"price-asc","keywords":["headphones"]}
"latest iphone" → {"category":"technology","priceMax":null,"priceMin":null,"sort":"newest","keywords":["iphone"]}
"red dress for party" → {"category":"fashion","priceMax":null,"priceMin":null,"sort":null,"keywords":["red","dress","party"]}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query.trim() },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 200,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";
    let filters;
    try {
      filters = JSON.parse(text);
    } catch {
      logger.warn({ text }, "groq returned non-JSON for searchTranslate");
      throw new AppError(502, ERROR_CODES.UPSTREAM_ERROR, "AI returned an unparseable response");
    }

    // Sanitise — drop any fields outside the allowed shape
    const safe = {
      category: CATEGORIES.includes(filters.category) ? filters.category : null,
      priceMax: typeof filters.priceMax === "number" && filters.priceMax > 0 ? filters.priceMax : null,
      priceMin: typeof filters.priceMin === "number" && filters.priceMin >= 0 ? filters.priceMin : null,
      sort: ["price-asc", "price-desc", "newest", "rating"].includes(filters.sort) ? filters.sort : null,
      keywords: Array.isArray(filters.keywords)
        ? filters.keywords.filter((k) => typeof k === "string").slice(0, 3)
        : [],
    };

    res.json({ success: true, data: { filters: safe } });
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error({ err: err.message }, "groq searchTranslate failed");
    throw new AppError(502, ERROR_CODES.UPSTREAM_ERROR, "AI search is temporarily unavailable");
  }
});
