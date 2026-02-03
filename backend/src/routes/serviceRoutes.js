import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import { protect, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import Joi from "joi";

const router = express.Router();

const objectId = Joi.string().hex().length(24);

const idParamSchema = Joi.object({
  id: objectId.required(),
});

// /api/services
/**
 * @route   GET /api/services
 * @desc    Get all services (optionally filtered by business)
 * @access  Public
 */
router
  .route("/")
  .get(getAllServices)

  /**
   * @route   POST /api/services
   * @desc    Create a new service
   * @access  Private (Business, Admin)
   */
  .post(
    protect, // 1. Authenticate
    requireRole("business", "admin"), // 2. Authorize
    createService // 3. Create Service
  );

/**
 * @route   GET /api/services/:id
 * @desc    Get a single service by ID
 * @access  Public
 */
router
  .route("/:id")
  .get(getServiceById)

  /**
   * @route   PUT /api/services/:id
   * @desc    Update a service
   * @access  Private (Business of that service, Admin)
   */
  .put(
    protect, // 1. Authenticate
    requireRole("business", "admin"), // 2. Authorize
    validate(idParamSchema, "params"), // 3. Validate ID
    updateService // 4. Update Service
  )

  /**
   * @route   DELETE /api/services/:id
   * @desc    Delete a service
   * @access  Private (Business of that service, Admin)
   */
  .delete(
    protect, // 1. Authenticate
    requireRole("business", "admin"), // 2. Authorize
    validate(idParamSchema, "params"), // 3. Validate ID
    deleteService // 4. Delete Service
  );

export default router;
