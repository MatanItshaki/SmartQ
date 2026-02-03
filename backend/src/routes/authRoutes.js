// routes/authRoutes.js
import express from "express";
import Joi from "joi";

import { validate } from "../middleware/validateMiddleware.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

import {
  register,
  login,
  me,
  registerEmployee,
  registerBusinessOwner,
} from "../controllers/authController.js";

const router = express.Router();

// ---------------------------------------------------------
// Joi Validation Schemas
// Ensures that incoming request bodies follow strict rules
// before reaching the controller.
// ---------------------------------------------------------

// Schema for standard client registration
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().max(30).allow("", null),
});

// Schema for user login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

// Schema for registering an employee (requires businessId)
const registerEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().max(30).allow("", null),
  businessId: Joi.string().required(),
});

// Schema for registering a business owner
const registerbusinessOwnerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().max(30).allow("", null),
  businessId: Joi.string().required(),
});

// --------------------
// Public Routes
// Accessible by anyone (unauthenticated users)
// --------------------

/**
 * @route   POST /api/auth/register
 * @desc    Register a new client
 * @access  Public
 */
router.post("/register", 
  validate(registerSchema), // 1. Validate Registration Data
  register // 2. Create Client
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post("/login", 
  validate(loginSchema), // 1. Validate Login Creds
  login // 2. Authenticate & Issue Token
);

// --------------------
// Protected Routes
// Requires a valid JWT token
// --------------------

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (Authenticated users)
 */
router.get("/me", 
  protect, // 1. Verify Token
  me // 2. Return User Profile
);

// -------------------------
// Admin / Business Routes
// Requires specific roles to access
// -------------------------

/**
 * @route   POST /api/auth/register-employee
 * @desc    Create a new employee user
 * @access  Private (Business owners or Admins only)
 */
router.post(
  "/register-employee",
  protect, // 1. Authenticate
  requireRole("business", "admin"), // 2. Authorize: Busines Owner/Admin
  validate(registerEmployeeSchema), // 3. Validate Employee Data
  registerEmployee // 4. Create Employee
);


/**
 * @route   POST /api/auth/register-business
 * @desc    Create a new business owner user
 * @access  Private (Admins only)
 */
router.post(
  "/register-business",
  protect, // 1. Authenticate
  requireRole("admin"), // 2. Authorize: Admin only
  validate(registerbusinessOwnerSchema), // 3. Validate Owner Data
  registerBusinessOwner // 4. Create Business Owner
);

export default router;