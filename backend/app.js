import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import businessRoutes from "./src/routes/businessRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import appointmentRoutes from "./src/routes/appointmentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

import errorMiddleware from "./src/middleware/errorMiddleware.js";

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("SmartQ API is running!");
});

// Routes
app.use("/api/business", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handling
app.use(errorMiddleware);

export default app;
