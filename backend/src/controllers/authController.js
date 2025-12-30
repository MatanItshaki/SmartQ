// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Client from "../models/Client.js";
import Employee from "../models/Employee.js";
import BusinessOwner from "../models/BusinessOwner.js"; // תיצור את הקובץ הזה כמו שעשינו

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,                 // "client" | "employee" | "business"
      businessId: user.businessId ?? null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken(user);

  // passwordHash כבר נמחק ב-toJSON אצלך, אבל נשמור safe payload ברור:
  const safeUser = {
    _id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    businessId: user.businessId ?? null,
  };

  const useCookie = String(process.env.JWT_USE_COOKIE || "false") === "true";
  if (useCookie) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  return res.status(statusCode).json({ token, user: safeUser });
};

// --------------------
// POST /api/auth/register (Client)
// --------------------
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const client = await Client.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() ?? "",
      passwordHash,
      // role נקבע אוטומטית ע"י discriminator: "client"
    });

    return sendAuthResponse(res, client, 201);
  } catch (err) {
    return next(err);
  }
};

// --------------------
// POST /api/auth/login (ALL ROLES)
// --------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // חייבים להביא passwordHash לכן לא lean()
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    return sendAuthResponse(res, user, 200);
  } catch (err) {
    return next(err);
  }
};

// --------------------
// GET /api/auth/me
// --------------------
export const me = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

// --------------------
// POST /api/auth/logout (cookies only)
// --------------------
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out" });
};

// --------------------
// OPTIONAL: Register employee/business
// (תעשה את זה מוגן: רק business/admin)
// --------------------
export const registerEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, businessId } = req.body;

    if (!name || !email || !password || !businessId) {
      return res.status(400).json({ message: "name, email, password, businessId are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() ?? "",
      passwordHash,
      businessId,
    });

    return sendAuthResponse(res, employee, 201);
  } catch (err) {
    return next(err);
  }
};

export const registerBusinessOwner = async (req, res, next) => {
  try {
    const { name, email, password, phone, businessId } = req.body;

    if (!name || !email || !password || !businessId) {
      return res.status(400).json({ message: "name, email, password, businessId are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const businessOwner = await BusinessOwner.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() ?? "",
      passwordHash,
      businessId,
    });

    return sendAuthResponse(res, businessOwner, 201);
  } catch (err) {
    return next(err);
  }
};
