// Vitest global setup — runs before any test file.
// We force a test env so config/env.js doesn't bail out, and we provide
// minimal-but-valid values for required vars.
process.env.NODE_ENV = "test";
process.env.MONGOOSE_URI = process.env.MONGOOSE_URI || "mongodb://localhost:27017/nexkart-test";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
process.env.ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY || "test-access-secret-please-rotate";
process.env.REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || "test-refresh-secret-please-rotate";
process.env.LOG_LEVEL = "fatal"; // silence pino during tests
