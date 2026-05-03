import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import requestId from "../middleware/requestId.js";
import errorHandler from "../middleware/errorHandler.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../middleware/AppError.js";
import { ERROR_CODES } from "../constants/index.js";

function buildApp(handler) {
  const app = express();
  app.use(express.json());
  app.use(requestId);
  app.get("/test", asyncHandler(handler));
  app.use(errorHandler);
  return app;
}

describe("requestId middleware", () => {
  it("generates a unique id when none is provided", async () => {
    const app = buildApp((req, res) => res.json({ id: req.id }));
    const res = await request(app).get("/test");
    expect(res.body.id).toBeDefined();
    expect(res.body.id.length).toBeGreaterThan(20);
  });

  it("reuses caller-provided id (within length limit)", async () => {
    const app = buildApp((req, res) => res.json({ id: req.id }));
    const res = await request(app).get("/test").set("X-Request-Id", "abc-123");
    expect(res.body.id).toBe("abc-123");
  });
});

describe("errorHandler middleware", () => {
  it("converts AppError to structured response", async () => {
    const app = buildApp(() => {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, "Cart not found");
    });
    const res = await request(app).get("/test");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "Cart not found" },
      requestId: expect.any(String),
    });
  });

  it("hides unknown error details and returns INTERNAL_ERROR with 500", async () => {
    const app = buildApp(() => {
      throw new Error("DB connection lost — secret stack trace inside");
    });
    const res = await request(app).get("/test");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    expect(res.body.error.message).not.toContain("secret stack trace");
  });

  it("forwards async rejections through asyncHandler", async () => {
    const app = buildApp(async () => {
      throw new AppError(409, ERROR_CODES.CONFLICT, "Already exists");
    });
    const res = await request(app).get("/test");
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });
});
