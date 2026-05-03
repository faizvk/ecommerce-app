import { v4 as uuid } from "uuid";

/**
 * Tags every incoming request with a unique ID, exposed at `req.id` and
 * echoed back via the `X-Request-Id` header. Use it for log correlation.
 */
export function requestId(req, res, next) {
  const incoming = req.headers["x-request-id"];
  req.id = (typeof incoming === "string" && incoming.length <= 100) ? incoming : uuid();
  res.setHeader("X-Request-Id", req.id);
  next();
}

export default requestId;
