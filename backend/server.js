import dotenv from "dotenv";
dotenv.config();            // ✅ load env FIRST

import app from "./app.js";
import connectDB from "./src/config/db.js";

connectDB();                // ✅ now MONGO_URI is defined

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` SmartQ API running on http://localhost:${PORT}`);
});
  