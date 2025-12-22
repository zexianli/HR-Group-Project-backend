import { Router } from "express";
import { register } from "../controllers/registrationController.js";

const router = Router();

router.post("/register", register);

export default router;
