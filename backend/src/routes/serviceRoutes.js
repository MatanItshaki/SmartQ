import express from "express";
import { getServices, createService } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getServices);
router.post("/", createService);

export default router;
