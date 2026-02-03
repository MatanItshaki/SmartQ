// routes/clientRoutes.js
import express from "express";
import Joi from "joi";

import { protect, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getAllClients,
  getClientById,
  deleteClientById,
} from "../controllers/clientController.js";

const router = express.Router();

/**
 * MongoDB ObjectId Validation Helper
 * Ensures the ID provided in the URL params is a valid 24-character hex string.
 */
const objectId = Joi.string().hex().length(24);

// ---------------------------------------------------------
// Joi Validation Schemas
// ---------------------------------------------------------

// Validates partial profile updates
const updateMeSchema = Joi.object({
  name: Joi.string().min(2).max(60).optional(),
  phone: Joi.string().max(30).allow("", null).optional(),
});

// Validates password change requests
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).max(128).required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

// Validates ID parameters in URL
const idParamSchema = Joi.object({
  id: objectId.required(),
});

// --------------------
// Client Self Routes
// --------------------

/**
 * @route   GET /api/clients/me
 * @desc    Get the current user's profile
 * @access  Private (Client / Admin)
 */
router.get("/me", 
  protect, // 1. Authenticate 
  requireRole("client", "admin"), // 2. Authorize
  getMyProfile // 3. Return Profile
);

/**
 * @route   PATCH /api/clients/me
 * @desc    Update current user's personal details
 * @access  Private (Client / Admin)
 */
router.patch(
  "/me",
  protect, // 1. Authenticate
  requireRole("client", "admin"), // 2. Authorize
  validate(updateMeSchema), // 3. Validate Updates
  updateMyProfile // 4. Update Profile
);

/**
 * @route   PATCH /api/clients/me/password
 * @desc    Change current user's password
 * @access  Private (Client / Admin)
 */
router.patch(
  "/me/password",
  protect, // 1. Authenticate
  requireRole("client", "admin"), // 2. Authorize
  validate(changePasswordSchema), // 3. Validate Passwords
  changeMyPassword // 4. Update Password
);

// --------------------
// Admin Management Routes
// --------------------

/**
 * @route   GET /api/clients
 * @desc    Get a list of all registered clients
 * @access  Private (Admin only)
 */
router.get("/", 
  protect, // 1. Authenticate
  requireRole("admin"), // 2. Authorize: Admin only
  getAllClients // 3. Fetch All
);

/**
 * @route   GET /api/clients/:id
 * @desc    Get details of a specific client by ID
 * @access  Private (Admin only)
 */
router.get(
  "/:id",
  protect, // 1. Authenticate
  requireRole("admin"), // 2. Authorize
  validate(idParamSchema, "params"), // 3. Validate ID
  getClientById // 4. Fetch Client
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Permanently delete a client account
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  protect, // 1. Authenticate
  requireRole("admin"), // 2. Authorize
  validate(idParamSchema, "params"), // 3. Validate ID
  deleteClientById // 4. Delete Client
);

export default router;