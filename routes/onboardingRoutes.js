import express from 'express';
import { authenticate, employeeOnly } from '../middlewares/auth.js';
import { validateOnboarding } from '../middlewares/validateOnboarding.js';
import { submitOnboarding } from '../controllers/onboardingController.js';

const router = express.Router();

router.post('/onboarding', authenticate, employeeOnly, validateOnboarding, submitOnboarding);

export default router;
