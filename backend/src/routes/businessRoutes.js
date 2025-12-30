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

// /api/business
router
  .route("/")
  .get(getAllBusinesses) // public
  .post(
    protect,
    requireRole("admin"), // 🔐 רק admin יוצר עסקים
    createBusiness
  );

// /api/business/:id
router
  .route("/:id")
  .get(getBusinessById) // public
  .put(
    protect,
    requireRole("business", "admin"), // 🔐 business/admin
    updateBusiness
  )
  .delete(
    protect,
    requireRole("business", "admin"), // 🔐 business/admin
    deleteBusiness
  );

export default router;
