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

// --------------------
// Joi Schemas
// --------------------
const updateMeSchema = Joi.object({
  name: Joi.string().min(2).max(60).optional(),
  phone: Joi.string().max(30).allow("", null).optional(),
  // email בד"כ לא משנים בלי אימות מחדש - אם אתה רוצה אפשר להוסיף
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).max(128).required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

// --------------------
// Client self routes
// --------------------
router.get("/me", protect, requireRole("client", "admin"), getMyProfile);

router.patch(
  "/me",
  protect,
  requireRole("client", "admin"),
  validate(updateMeSchema),
  updateMyProfile
);

router.patch(
  "/me/password",
  protect,
  requireRole("client", "admin"),
  validate(changePasswordSchema),
  changeMyPassword
);

// --------------------
// Admin management routes
// --------------------
router.get("/", protect, requireRole("admin"), getAllClients);

router.get(
  "/:id",
  protect,
  requireRole("admin"),
  validate(idParamSchema, "params"),
  getClientById
);

router.delete(
  "/:id",
  protect,
  requireRole("admin"),
  validate(idParamSchema, "params"),
  deleteClientById
);

export default router;
