import { Router } from "express";
import { healthCheck } from "../controllers/healthController.js";

const router = Router();

router.get("/health", healthCheck);

export default router;
