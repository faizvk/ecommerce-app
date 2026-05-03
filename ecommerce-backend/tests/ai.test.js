import { describe, it, expect, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET_KEY } from "../config/env.js";

// We mock the Groq SDK so the controller doesn't make real API calls during
// tests — and so we can assert on behaviour without network dependencies.
const groqCreate = vi.fn();

vi.mock("groq-sdk", () => ({
  default: vi.fn(() => ({
    chat: { completions: { create: groqCreate } },
  })),
}));

// Mock the Product model so we don't hit a real DB
vi.mock("../model/product.model.js", () => ({
  default: {
    find: () => ({
      sort: () => ({
        limit: () => ({
          lean: async () => [
            { _id: "p1", name: "Wireless Earbuds", salePrice: 999, category: "electronics" },
            { _id: "p2", name: "Cotton T-Shirt", salePrice: 499, category: "fashion" },
          ],
        }),
      }),
    }),
  },
}));

const { chat, searchTranslate } = await import("../controller/ai.controller.js");
const requestId = (await import("../middleware/requestId.js")).default;
const errorHandler = (await import("../middleware/errorHandler.js")).default;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(requestId);
  // Stub auth — we test the controller logic, not auth (covered elsewhere)
  app.use((req, _res, next) => {
    req.user = { id: "u1", email: "test@example.com", role: "user" };
    next();
  });
  app.post("/api/ai/chat", chat);
  app.post("/api/ai/search-translate", searchTranslate);
  app.use(errorHandler);
  return app;
}

const validToken = jwt.sign(
  { id: "u1", email: "test@example.com", role: "user" },
  ACCESS_SECRET_KEY,
  { algorithm: "HS256", issuer: "faiz", expiresIn: "5m" }
);

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    groqCreate.mockReset();
  });

  it("returns 400 when messages array is missing or empty", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", `Bearer ${validToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when a message has invalid role", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ messages: [{ role: "system", content: "hi" }] });
    expect(res.status).toBe(400);
  });

  it("returns assistant reply when Groq succeeds", async () => {
    groqCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Hi! Looking for headphones?" } }],
      model: "llama-3.3-70b-versatile",
    });
    const app = buildApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ messages: [{ role: "user", content: "find me cheap earbuds" }] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toBe("Hi! Looking for headphones?");
    // System prompt + user message
    expect(groqCreate).toHaveBeenCalledOnce();
    const call = groqCreate.mock.calls[0][0];
    expect(call.messages[0].role).toBe("system");
    expect(call.messages[0].content).toContain("NexKart");
    expect(call.messages[0].content).toContain("Wireless Earbuds"); // catalog injected
    expect(call.messages.at(-1).content).toBe("find me cheap earbuds");
  });

  it("returns 502 when Groq throws", async () => {
    groqCreate.mockRejectedValueOnce(new Error("upstream timeout"));
    const app = buildApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ messages: [{ role: "user", content: "hi" }] });
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("UPSTREAM_ERROR");
    // Internal error message must NOT leak
    expect(res.body.error.message).not.toContain("upstream timeout");
  });
});

describe("POST /api/ai/search-translate", () => {
  beforeEach(() => {
    groqCreate.mockReset();
  });

  it("returns 400 when query is missing", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/ai/search-translate")
      .set("Authorization", `Bearer ${validToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("returns sanitised filters from valid AI JSON", async () => {
    groqCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "electronics",
              priceMax: 2000,
              priceMin: null,
              sort: "price-asc",
              keywords: ["headphones", "wireless"],
            }),
          },
        },
      ],
    });
    const app = buildApp();
    const res = await request(app)
      .post("/api/ai/search-translate")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ query: "wireless headphones under 2000" });
    expect(res.status).toBe(200);
    expect(res.body.data.filters).toEqual({
      category: "electronics",
      priceMax: 2000,
      priceMin: null,
      sort: "price-asc",
      keywords: ["headphones", "wireless"],
    });
  });

  it("strips invalid fields and falls back to nulls", async () => {
    groqCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "weapons",
              priceMax: -5,
              sort: "random",
              keywords: "not-an-array",
            }),
          },
        },
      ],
    });
    const app = buildApp();
    const res = await request(app)
      .post("/api/ai/search-translate")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ query: "anything" });
    expect(res.status).toBe(200);
    expect(res.body.data.filters).toEqual({
      category: null,
      priceMax: null,
      priceMin: null,
      sort: null,
      keywords: [],
    });
  });

  it("returns 502 when Groq returns non-JSON", async () => {
    groqCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "not json at all" } }],
    });
    const app = buildApp();
    const res = await request(app)
      .post("/api/ai/search-translate")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ query: "anything" });
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("UPSTREAM_ERROR");
  });
});
