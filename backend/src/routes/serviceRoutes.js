import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

// /api/services
router.route("/")
  .get(getAllServices)
  .post(createService);

// /api/services/:id
router.route("/:id")
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService);

export default router;
