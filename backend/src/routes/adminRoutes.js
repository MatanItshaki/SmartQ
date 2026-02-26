// routes/adminRoutes.js
import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    toggleUserStatus,
    deleteUser,
    getAllAppointments,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, requireRole("admin"));

/**
 * @route   GET /api/admin/stats
 * @desc    Get system-wide dashboard statistics
 * @access  Private (Admin only)
 */
router.get("/stats", getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (optionally filter by ?role=client|employee|business|admin)
 * @access  Private (Admin only)
 */
router.get("/users", getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a single user by ID
 * @access  Private (Admin only)
 */
router.get("/users/:id", getUserById);

/**
 * @route   PATCH /api/admin/users/:id/toggle-status
 * @desc    Toggle active/inactive status of a user
 * @access  Private (Admin only)
 */
router.patch("/users/:id/toggle-status", toggleUserStatus);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete("/users/:id", deleteUser);

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments across the system
 * @access  Private (Admin only)
 */
router.get("/appointments", getAllAppointments);

export default router;
