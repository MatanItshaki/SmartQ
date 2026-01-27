// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Business from "../models/Business.js";
import User from "../models/User.js";
import Client from "../models/Client.js";
import Employee from "../models/Employee.js"; 
import BusinessOwner from "../models/BusinessOwner.js";

/**
 * Generates a Signed JWT Token
 * Payload includes: user ID, role, and business link.
 */
const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role, // "client" | "employee" | "business" | "admin"
      businessId: user.businessId ?? null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Standardizes the Auth Response
 * Sends the token and non-sensitive user data to the client.
 * Supports both JSON response and secure HttpOnly cookies.
 */
const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken(user);

  // Define a safe payload to avoid sending sensitive data like passwordHash
  const safeUser = {
    _id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    businessId: user.businessId ?? null,
  };

  // Optional: Handle Cookie-based authentication
  const useCookie = String(process.env.JWT_USE_COOKIE || "false") === "true";
  if (useCookie) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true, // Prevents XSS attacks
      secure: isProd, // Only send over HTTPS in production
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return res.status(statusCode).json({ token, user: safeUser });
};

/**
 * POST /api/auth/register
 * Public route to register new customers (Clients).
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) return res.status(409).json({ message: "Email already in use" });

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create client (Discriminator will set role to "client")
    const client = await Client.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() ?? "",
      passwordHash,
    });

    return sendAuthResponse(res, client, 201);
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/auth/login
 * Unified login for all roles.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user and explicitly include passwordHash for comparison
    const user = await User.findOne({ email: normalizedEmail }).select(
      "_id name email phone role businessId isActive passwordHash"
    );

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.passwordHash) {
      return res.status(500).json({ message: "User record is corrupted (missing hash)." });
    }

    // Compare provided password with stored hash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    return sendAuthResponse(res, user, 200);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns current logged-in user details.
 */
export const me = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out" });
};

/**
 * POST /api/auth/register-employee
 * Protected route to create employees under a business.
 */
export const registerEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, businessId } = req.body;

    if (!name || !email || !password || !businessId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ VERIFY BUSINESS EXISTS: Prevent linking to a "ghost" business
    const businessExists = await Business.exists({ _id: businessId });
    if (!businessExists) {
      return res.status(404).json({ message: "Specified business does not exist" });
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
      businessId, // Link employee to specific business
    });

    return sendAuthResponse(res, employee, 201);
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/auth/register-business-owner
 * Creates a user with business management privileges.
 */
export const registerBusinessOwner = async (req, res, next) => {
  try {
    const { name, email, password, phone, businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({ message: "businessId is required to create an owner" });
    }

    // ✅ VERIFY BUSINESS EXISTS
    const businessExists = await Business.exists({ _id: businessId });
    if (!businessExists) {
      return res.status(404).json({ message: "Cannot create owner: Business not found" });
    }

    const normalizedEmail = email.toLowerCase().trim();
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