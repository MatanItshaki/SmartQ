import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
    getMyBusinessStats,
    getMyBusiness,
    updateMyBusiness,
    getMyEmployees,
    removeEmployee,
    getMyServices,
    createMyService,
    updateMyService,
    deleteMyService,
    getMyAppointments,
    updateAppointmentStatus,
} from "../controllers/businessOwnerController.js";

const router = express.Router();

// All routes require authentication + business owner role
router.use(protect, requireRole("business"));

// Dashboard stats
router.get("/stats", getMyBusinessStats);

// Business info
router.get("/my-business", getMyBusiness);
router.patch("/my-business", updateMyBusiness);

// Employees
router.get("/employees", getMyEmployees);
router.delete("/employees/:id", removeEmployee);

// Services
router.get("/services", getMyServices);
router.post("/services", createMyService);
router.put("/services/:id", updateMyService);
router.delete("/services/:id", deleteMyService);

// Appointments
router.get("/appointments", getMyAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);

export default router;
