import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import businessRoutes from "./routes/businessRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // פרונט של Vite
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SmartQ API is running" });
});

// Routes
app.use("/api/businesses", businessRoutes);
app.use("/api/services", serviceRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

export default app;
