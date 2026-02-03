// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Business from "../models/Business.js";
import User from "../models/User.js";
import Client from "../models/Client.js";
import Employee from "../models/Employee.js"; 
import BusinessOwner from "../models/BusinessOwner.js";

/**
 * Generates a signed JWT Token.
 * 
 * Payload includes the user's ID, role, and associated business ID (if any).
 * 
 * @param {object} user - The user object.
 * @returns {string} Signed JWT string.
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
 * Standardizes the Authentication Response.
 * 
 * Sends the JWT token and a sanitized user object (excluding sensitive data) to the client.
 * Can optionally set an HttpOnly cookie if configured.
 * 
 * @param {import("express").Response} res - Express response object.
 * @param {object} user - The user object.
 * @param {number} [statusCode=200] - HTTP status code.
 * @returns {import("express").Response}
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
 * Registers a new Client user.
 * 
 * Validates input, checks for existing email, hashes the password, and creates a new Client document.
 * Returns a 201 response with the new user and token.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
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
 * Logs in a user.
 * 
 * Authenticates credentials for any user role. Verifies the password against the stored hash.
 * Returns a 200 response with the user and token.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
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
      return res.status(500). json({ message: "User record is corrupted (missing hash)." });
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
 * Retrieves the currently logged-in user's details.
 * 
 * Uses the user ID attached to the request by the auth middleware.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
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
 * Logs out the user.
 * 
 * Clears the authentication cookie if it exists.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
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
 * Registers a new Employee under a specific Business.
 * 
 * Verifies that the target business exists before creating the employee.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const registerEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, businessId } = req.body;

    if (!name || !email || !password || !businessId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // VERIFY BUSINESS EXISTS: Prevent linking to a "ghost" business
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
 * Registers a new Business Owner.
 * 
 * Verifies that the target business exists before creating the owner.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const registerBusinessOwner = async (req, res, next) => {
  try {
    const { name, email, password, phone, businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({ message: "businessId is required to create an owner" });
    }

    // VERIFY BUSINESS EXISTS
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