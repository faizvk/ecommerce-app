/**
 * Wraps an async route handler so any thrown / rejected error is forwarded to
 * Express's error middleware. Eliminates the need for try/catch in every controller.
 *
 *   app.get("/foo", asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
