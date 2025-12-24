import express from 'express';
import { employeeOnly } from '../middlewares/tempAuth.js';
import { validateOnboarding } from '../middlewares/validateOnboarding.js';
import { submitOnboarding } from '../controllers/onboardingController.js';

const router = express.Router();

router.post('/onboarding', employeeOnly, validateOnboarding, submitOnboarding);

export default router;
