import express from "express";
import cors from "cors";
import businessRoutes from "./src/routes/businessRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import errorMiddleware from "./src/middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartQ API is running!");
});

// Routes
app.use("/api/business", businessRoutes);
app.use("/api/services", serviceRoutes);

// Error handling
app.use(errorMiddleware);

export default app;
