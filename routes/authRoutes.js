import express from "express";
import { register, validateToken } from "../controllers/authController.js";

const router = express.Router();

router.get("/validate-token", validateToken);
router.post("/register", register);

export default router;
