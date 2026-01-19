// routes/appointmentRoutes.js
import express from "express";
import Joi from "joi";

import {
  createAppointment,
  getBusinessAppointments,
  getMyAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/appointmentController.js";

import { protect, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// ---------------------------------------------------------
// Joi Validation Schemas
// These schemas ensure the incoming data matches the required
// format before the controller logic is executed.
// ---------------------------------------------------------

// Schema for creating a new appointment via POST request body
const createAppointmentSchema = Joi.object({
  businessId: Joi.string().required(),
  employeeId: Joi.string().required(),
  serviceId: Joi.string().required(),
  startTime: Joi.date().iso().required(), // Validates ISO 8601 date format
  endTime: Joi.date().iso().required(),
  notes: Joi.string().max(500).allow("", null), // Optional notes field
});

// Schema for filtering business appointments via URL query parameters
const businessAppointmentsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  employeeId: Joi.string().optional(),
  status: Joi.string()
    .valid("scheduled", "cancelled", "completed") // Must match Appointment model enums
    .optional(),
});

// Schema for personal appointments (My Appointments) query parameters
const myAppointmentsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  status: Joi.string()
    .valid("scheduled", "cancelled", "completed")
    .optional(),
});

// Schema for updating an appointment status via PATCH request body
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("scheduled", "cancelled", "completed")
    .required(),
});

// Schema for validating the MongoDB ID in the URL params
const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

// --------------------
// API Routes Definitions
// --------------------

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private (Clients & Admins only)
 */
router.post(
  "/",
  protect,
  requireRole("client", "admin"),
  validate(createAppointmentSchema),
  createAppointment
);

/**
 * @route   GET /api/appointments/me
 * @desc    Get appointments for the logged-in Client or Employee
 * @access  Private (Client, Employee, Admin)
 */
router.get(
  "/me",
  protect,
  requireRole("client", "employee", "admin"),
  validate(myAppointmentsQuerySchema, "query"), // Validates data in req.query
  getMyAppointments
);

/**
 * @route   GET /api/appointments/business/:businessId
 * @desc    Get all appointments for a specific business
 * @access  Private (Business owners, Employees of that business, Admin)
 */
router.get(
  "/business/:businessId",
  protect,
  requireRole("business", "admin", "employee"),
  validate(businessAppointmentsQuerySchema, "query"),
  getBusinessAppointments
);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status (e.g., complete or cancel)
 * @access  Private (Authenticated users based on controller logic)
 */
router.patch(
  "/:id/status",
  protect,
  requireRole("client", "business", "admin", "employee"),
  validate(idParamSchema, "params"), // Validates the :id in URL
  validate(updateStatusSchema),     // Validates the status in Body
  updateAppointmentStatus
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Hard delete an appointment record
 * @access  Private (Admin & Business owners only)
 */
router.delete(
  "/:id",
  protect,
  requireRole("business", "admin"),
  validate(idParamSchema, "params"),
  deleteAppointment
);

export default router;