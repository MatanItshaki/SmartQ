// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Middleware that protects routes by verifying the JWT token.
 * 
 * It checks for the token in the `Authorization` header (Bearer scheme) or in cookies.
 * If a valid token is found, it decodes it and attaches the user payload to `req.user`.
 * If the token is missing or invalid, it sends a 401 Unauthorized response.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {void}
 */
export const protect = (req, res, next) => {
  let token;

  // Try to get token from Authorization header (Bearer scheme)
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Fallback: Try to get token from cookies
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  // No token found: block request
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify JWT and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request for downstream handlers
    req.user = {
      id: decoded.id,
      role: decoded.role,
      businessId: decoded.businessId ?? null,
    };

    next(); // Continue to next middleware/route
  } catch (error) {
    // Invalid token: block request
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * Middleware factory that restricts access to specific user roles.
 * 
 * Checks if the authenticated user's role (attached to `req.user` by `protect` middleware)
 * is included in the allowed `roles`.
 * 
 * @param {...string} roles - List of allowed roles (e.g., "admin", "business").
 * @returns {import("express").RequestHandler} Express middleware function.
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    // No user found: block request
    if (!userRole) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Role not allowed: block request
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next(); // Continue to next middleware/route
  };
};
