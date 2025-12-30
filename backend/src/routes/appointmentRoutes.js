// routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  getBusinessAppointments,
  getMyAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/appointmentController.js";

import { protect, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import Joi from "joi";

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
    .valid("pending", "confirmed", "cancelled", "completed", "no_show")
    .optional(),
});

const myAppointmentsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "completed", "no_show")
    .optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "completed", "no_show")
    .required(),
});

// --------------------
// Routes
// --------------------

// Create appointment (client)
router.post(
  "/",
  protect,
  requireRole("client", "admin", "business"), // אם אתה רוצה רק client: תחליף ל("client")
  validate(createAppointmentSchema),
  createAppointment
);

// My appointments (client)
router.get(
  "/me",
  protect,
  requireRole("client", "admin"),
  validate(myAppointmentsQuerySchema, "query"),
  getMyAppointments
);

// Business appointments (business/admin)
router.get(
  "/business/:businessId",
  protect,
  requireRole("business", "admin"),
  validate(businessAppointmentsQuerySchema, "query"),
  getBusinessAppointments
);

// Update appointment status
router.patch(
  "/:id/status",
  protect,
  requireRole("client", "business", "admin"),
  validate(updateStatusSchema),
  updateAppointmentStatus
);

// Delete appointment (optional; recommended admin/business only)
router.delete(
  "/:id",
  protect,
  requireRole("business", "admin"),
  deleteAppointment
);

export default router;
