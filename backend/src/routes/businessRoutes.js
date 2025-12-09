import express from "express";
import {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
} from "../controllers/businessController.js";

const router = express.Router();

// /api/business
router.route("/")
  .get(getAllBusinesses)
  .post(createBusiness);

// /api/business/:id
router.route("/:id")
  .get(getBusinessById)
  .put(updateBusiness)
  .delete(deleteBusiness);

export default router;
