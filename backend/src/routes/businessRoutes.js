// routes/businessRoutes.js
import express from "express";
import {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
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
    protect,
    requireRole("admin"), 
    createBusiness
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
    protect,
    requireRole("business", "admin"), 
    updateBusiness
  )
  
  /**
   * @desc    Delete a business
   * @access  Private (Business Owner / Admin)
   */
  .delete(
    protect,
    requireRole("business", "admin"), 
    deleteBusiness
  );

export default router;