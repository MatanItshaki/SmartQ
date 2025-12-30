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
router
  .route("/")
  .get(getAllServices) // public
  .post(
    protect,
    requireRole("business", "admin"),
    createService
  );

// /api/services/:id
router
  .route("/:id")
  .get(getServiceById) // public
  .put(
    protect,
    requireRole("business", "admin"),
    validate(idParamSchema, "params"),
    updateService
  )
  .delete(
    protect,
    requireRole("business", "admin"),
    validate(idParamSchema, "params"),
    deleteService
  );

export default router;
