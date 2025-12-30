// routes/authRoutes.js
import express from "express";
import Joi from "joi";

import { validate } from "../middleware/validateMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

import {
  registerClient,
  loginClient,
  getMe,
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

// --------------------
// Routes
// --------------------

// Client register
router.post("/register", validate(registerSchema), registerClient);

// Client login
router.post("/login", validate(loginSchema), loginClient);

// Current logged-in user info
router.get("/me", protect, getMe);

export default router;
