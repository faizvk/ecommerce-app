import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("GET /api/health", () => {
  it("returns 200 with healthy status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ status: "healthy" }),
      })
    );
  });

  it("includes a request id header", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-request-id"]).toBeDefined();
    expect(res.headers["x-request-id"].length).toBeGreaterThan(0);
  });

  it("echoes incoming x-request-id header back", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("X-Request-Id", "test-id-12345");
    expect(res.headers["x-request-id"]).toBe("test-id-12345");
  });
});

describe("404 handler", () => {
  it("returns structured error envelope for unknown routes", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "NOT_FOUND",
          message: expect.any(String),
        }),
      })
    );
  });
});
