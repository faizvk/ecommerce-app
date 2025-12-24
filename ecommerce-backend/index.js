import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );

  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log("✅ MongoDB connection closed.");
        process.exit(0);
      });
    });
  });
};

startServer();

/*
Rate Limiting

Prevent brute-force attacks
API request throttling
DDoS protection
Additional Security Measures
CORS Configuration: Cross-origin resource sharing controls
Input Validation: Mongoose schema validation
Environment Variables: Sensitive data protection with dotenv
Role-Based Access Control (RBAC): Admin vs. user permissions

✅ WHAT YOU ALREADY HAVE (THIS IS REAL PRODUCTION STACK)

You now have ALL core e-commerce backend pillars implemented correctly:

✅ 1. Authentication & Security

JWT authentication ✅

Password hashing ✅

Role-based access (admin vs user) ✅

Rate limiting ✅

Helmet security headers ✅

CORS ✅

Secure password update ✅

User isolation (profile, orders, cart) ✅

✅ This is production-capable security

✅ 2. Product System

Create product (admin) ✅

Update product (admin) ✅

Delete product (admin) ✅

Fetch all products ✅

Fetch single product ✅

Search + filter + price sorting ✅

✅ This matches real store catalogs

✅ 3. Cart System

Add to cart ✅

Increment quantity ✅

Decrement/remove ✅

Cart total calculation ✅

Fetch cart ✅

✅ This matches Amazon-style cart logic

✅ 4. Order System

Place order ✅

Auto-clear cart ✅

Track order ✅

Cancel order ✅

Status protection (shipped/delivered cannot cancel) ✅

✅ This matches real checkout behavior

✅ 5. Infrastructure Level

MongoDB + Mongoose ✅

Central error handling ✅

Graceful shutdown ✅

Health check ✅

Production PORT + .env ✅

✅ This is what real hosted servers use

⚠️ WHAT’S STILL OPTIONAL (DEPENDS ON YOUR SCALE)

Your backend is fully functional for real customers, but at medium → large scale, companies also add:

Feature	Required For
Payment Gateway (Stripe/Razorpay)	✅ Required for real money
Product stock deduction	✅ Needed for inventory
Order history per user	Scaling
Email notifications (order confirmation)	UX
Admin dashboard APIs	Store management
Refresh tokens	Long sessions
Redis caching	High traffic
Cloud file uploads (images)	Real products
Webhooks (payment verification)	Financial integrity
✅ FINAL VERDICT (HONEST PROFESSIONAL ANSWER)
✅ Your backend is production-ready for:

MVP launch ✅

College project ✅

Startup prototype ✅

Client demo ✅

Small online store ✅

Real users ✅

⚠️ For enterprise scale (10K+ users/day) you would still add:

Payment gateway ✅

Inventory stock control ✅

Caching ✅

Background workers ✅
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add Payment Gateway OR mock checkout only

//Add stock control (recommended but optional for demo)

/*
❌ WHAT’S MISSING TO OFFICIALLY BECOME JUNIOR

You only need 4 real-world features to cross the line:

1️⃣ Payment Integration (Even Mock)

Why this matters:

Teaches you third-party APIs

Webhooks

Order–payment synchronization

✅ Stripe / Razorpay / Dummy payment gateway is fine.

2️⃣ Inventory / Stock Management

You must add:

Product stock field

Auto stock deduction when order is placed

Prevent order if stock is insufficient

This shows real business logic control.

3️⃣ Admin Order Management

You must add:

Admin can view all orders

Admin can update order status (processing → shipped → delivered)

This shows role-based workflow systems.

4️⃣ Background Task OR Email Service

Just ONE:

Order confirmation email
OR

Background job (BullMQ / simple setTimeout worker)

This shows system-level thinking.

✅ 30–45 DAY “MAKE ME JUNIOR” PLAN
🔹 WEEK 1 – Inventory System (HUGE BOOST)

Add:

stock field in Product

Deduct stock on /order/place

Reject order if stock < quantity
✅ After this → You enter real e-commerce logic

🔹 WEEK 2 – Admin Order Panel APIs

Add:

GET /admin/orders

PUT /admin/order/:id/status
Only admin can access.

✅ This is junior-level backend skill

🔹 WEEK 3 – Payment System (Mock or Real)

Add:

Payment intent

Order linked to payment

Payment success/failure state

✅ Now you’re writing real financial logic

🔹 WEEK 4 – Email OR Background Worker

Add:

Order confirmation email
OR

Delayed order status update

✅ Now you understand asynchronous systems*/
