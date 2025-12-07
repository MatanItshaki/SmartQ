import express from "express";
import {
  getAllBusinesses,
  createBusiness,
  getBusinessById,
} from "../controllers/businessController.js";

const router = express.Router();

router.get("/", getAllBusinesses);
router.post("/", createBusiness);
router.get("/:id", getBusinessById);

export default router;
