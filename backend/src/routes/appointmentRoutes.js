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

// --------------------
// Joi Schemas
// --------------------
const createAppointmentSchema = Joi.object({
  businessId: Joi.string().required(),
  employeeId: Joi.string().required(),
  serviceId: Joi.string().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
  notes: Joi.string().max(500).allow("", null),
});

const businessAppointmentsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  employeeId: Joi.string().optional(),
  status: Joi.string()
    .valid("scheduled", "cancelled", "completed") // ✅ match model
    .optional(),
});

const myAppointmentsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  status: Joi.string()
    .valid("scheduled", "cancelled", "completed") // ✅ match model
    .optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("scheduled", "cancelled", "completed") // ✅ match model
    .required(),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

// --------------------
// Routes
// --------------------

// Create appointment (client only)
router.post(
  "/",
  protect,
  requireRole("client", "admin"),
  validate(createAppointmentSchema),
  createAppointment
);

// My appointments (client + employee can use this if your controller supports it)
router.get(
  "/me",
  protect,
  requireRole("client", "employee", "admin"),
  validate(myAppointmentsQuerySchema, "query"),
  getMyAppointments
);

// Business appointments (business/admin, optionally employee)
router.get(
  "/business/:businessId",
  protect,
  requireRole("business", "admin", "employee"),
  validate(businessAppointmentsQuerySchema, "query"),
  getBusinessAppointments
);

// Update appointment status
router.patch(
  "/:id/status",
  protect,
  requireRole("client", "business", "admin", "employee"),
  validate(idParamSchema, "params"),
  validate(updateStatusSchema),
  updateAppointmentStatus
);

// Delete appointment (optional; recommended admin/business only)
router.delete(
  "/:id",
  protect,
  requireRole("business", "admin"),
  validate(idParamSchema, "params"),
  deleteAppointment
);

export default router;
