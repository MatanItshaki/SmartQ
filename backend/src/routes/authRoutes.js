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
router.post("/register", validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post("/login", validate(loginSchema), login);

// --------------------
// Protected Routes
// Requires a valid JWT token
// --------------------

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (Authenticated users)
 */
router.get("/me", protect, me);

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
  protect,
  requireRole("business", "admin"),
  validate(registerEmployeeSchema),
  registerEmployee
);


/**
 * @route   POST /api/auth/register-business
 * @desc    Create a new business owner user
 * @access  Private (Admins only)
 */
router.post(
  "/register-business",
  protect,
  requireRole("admin"),
  validate(registerbusinessOwnerSchema),
  registerBusinessOwner
);

export default router;