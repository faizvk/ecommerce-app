// Vitest global setup — runs before any test file.
// We force a test env so config/env.js doesn't bail out, and we provide
// minimal-but-valid values for required vars.
process.env.NODE_ENV = "test";
process.env.MONGOOSE_URI = process.env.MONGOOSE_URI || "mongodb://localhost:27017/nexkart-test";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
process.env.ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY || "test-access-secret-please-rotate";
process.env.REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || "test-refresh-secret-please-rotate";
// Razorpay constructor rejects empty key_id at module load — payment.controller.js
// instantiates the client at import time, so even tests that don't hit /api/payment
// crash unless we provide *something*. Use clearly fake values to avoid accidental use.
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_for_tests";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "dummy_secret_for_tests";
process.env.LOG_LEVEL = "fatal"; // silence pino during tests
