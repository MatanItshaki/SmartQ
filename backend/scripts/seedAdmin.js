import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../src/models/Admin.js";

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "System Admin";

  if (!email || !password) {
    console.error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD");
    process.exit(1);
  }

  const exists = await Admin.findOne({ email }).lean();
  if (exists) {
    console.log("ℹ️ Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

const admin = await Admin.create({
  name,
  email,
  passwordHash,
  isActive: true,
});


  console.log("✅ Admin created:", admin.email);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
}); 
