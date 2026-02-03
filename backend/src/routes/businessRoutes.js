// routes/businessRoutes.js
import express from "express";
import {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,

  deleteBusiness,
  getEmployeesByBusiness,
} from "../controllers/businessController.js";

import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Route: /api/business
 */
router
  .route("/")
  /**
   * @desc    Get all businesses
   * @access  Public
   */
  .get(getAllBusinesses) 
  
  /**
   * @desc    Create a new business
   * @access  Private (Admin only)
   * @process 1. protect: Verifies JWT token
   * 2. requireRole: Ensures user role is 'admin'
   */
  .post(
    protect, // 1. Authenticate
    requireRole("admin"), // 2. Authorize: Admin only
    createBusiness // 3. Create Business
  );

/**
 * Route: /api/business/:id
 */
router
  .route("/:id")
  /**
   * @desc    Get a single business by ID
   * @access  Public
   */
  .get(getBusinessById) 
  
  /**
   * @desc    Update business details
   * @access  Private (Business Owner / Admin)
   * @process Uses PUT method to overwrite or update business data
   */
  .patch(
    protect, // 1. Authenticate
    requireRole("business", "admin"), // 2. Authorize: Owner/Admin
    updateBusiness // 3. Update Details
  )
  
  /**
   * @desc    Delete a business
   * @access  Private (Business Owner / Admin)
   */
  .delete(
    protect, // 1. Authenticate
    requireRole("business", "admin"), // 2. Authorize: Owner/Admin
    deleteBusiness // 3. Remove Business
  );

/**
 * Route: /api/business/:id/employees
 */
router.get("/:id/employees", getEmployeesByBusiness);

export default router;