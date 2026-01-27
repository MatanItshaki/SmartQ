// middleware/errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // MongoDB: invalid ObjectId
  if (err.name === "CastError") {
    message = "Resource not found";
  }

  // MongoDB: duplicate key (e.g. email unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} already exists`;
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    message = "Token expired";
  }

  // Log (full only in dev)
  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", err);
  } else {
    console.error("Error:", message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
