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
router.get("/me", protect, requireRole("client", "admin"), getMyProfile);

/**
 * @route   PATCH /api/clients/me
 * @desc    Update current user's personal details
 * @access  Private (Client / Admin)
 */
router.patch(
  "/me",
  protect,
  requireRole("client", "admin"),
  validate(updateMeSchema),
  updateMyProfile
);

/**
 * @route   PATCH /api/clients/me/password
 * @desc    Change current user's password
 * @access  Private (Client / Admin)
 */
router.patch(
  "/me/password",
  protect,
  requireRole("client", "admin"),
  validate(changePasswordSchema),
  changeMyPassword
);

// --------------------
// Admin Management Routes
// --------------------

/**
 * @route   GET /api/clients
 * @desc    Get a list of all registered clients
 * @access  Private (Admin only)
 */
router.get("/", protect, requireRole("admin"), getAllClients);

/**
 * @route   GET /api/clients/:id
 * @desc    Get details of a specific client by ID
 * @access  Private (Admin only)
 */
router.get(
  "/:id",
  protect,
  requireRole("admin"),
  validate(idParamSchema, "params"),
  getClientById
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Permanently delete a client account
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  protect,
  requireRole("admin"),
  validate(idParamSchema, "params"),
  deleteClientById
);

export default router;