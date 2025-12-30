import express from "express";
import cors from "cors";
import businessRoutes from "./src/routes/businessRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import errorMiddleware from "./src/middleware/errorMiddleware.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartQ API is running!");
});

// Routes
app.use("/api/business", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);


// Error handling
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

export default app;
