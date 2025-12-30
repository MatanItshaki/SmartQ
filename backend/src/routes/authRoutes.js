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

// --------------------
// Joi Schemas
// --------------------
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().max(30).allow("", null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const registerEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().max(30).allow("", null),
  businessId: Joi.string().required(),
});

const registerbusinessOwnerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().max(30).allow("", null),
  businessId: Joi.string().required(),
});

// --------------------
// Routes
// --------------------

// Client register
router.post("/register", validate(registerSchema), register);

// Login (ALL ROLES)
router.post("/login", validate(loginSchema), login);

// Current logged-in user info
router.get("/me", protect, me);

// --------------------
// Admin / Business routes
// --------------------

// Create employee (business/admin only)
router.post(
  "/register-employee",
  protect,
  requireRole("business", "admin"),
  validate(registerEmployeeSchema),
  registerEmployee
);

// Create business user (admin only, או business אם תרצה)
router.post(
  "/register-business",
  protect,
  requireRole("admin"),
  validate(registerbusinessOwnerSchema),
  registerBusinessOwner
);

export default router;
