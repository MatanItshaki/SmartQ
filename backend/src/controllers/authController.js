// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Client from "../models/Client.js";

const signToken = (clientId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  return jwt.sign({ id: clientId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sendAuthResponse = (res, client, statusCode = 200) => {
  const token = signToken(client._id);

  // remove password from output
  const safeClient = {
    _id: client._id,
    name: client.name,
    email: client.email,
    phone: client.phone,
  };

  // optional cookie support (if you use cookie-parser on backend)
  const useCookie = String(process.env.JWT_USE_COOKIE || "false") === "true";
  if (useCookie) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return res.status(statusCode).json({
    token,
    client: safeClient,
  });
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const exists = await Client.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const client = await Client.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      phone: phone?.trim(),
    });

    return sendAuthResponse(res, client, 201);
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const client = await Client.findOne({ email: email.toLowerCase().trim() });
    if (!client) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, client.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return sendAuthResponse(res, client, 200);
  } catch (err) {
    return next(err);
  }
};

// GET /api/auth/me  (requires auth middleware to set req.userId OR req.user.id)
export const me = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const client = await Client.findById(userId).select("-password");
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json({ client });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/logout (only relevant if you use cookies)
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out" });
};
