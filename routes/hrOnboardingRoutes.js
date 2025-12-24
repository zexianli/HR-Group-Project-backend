import express from 'express';
import { authenticate, hrOnly } from '../middlewares/auth.js';
import {
  approveOnboadingApplication,
  rejectOnboardingApplication,
} from '../controllers/hrOnboardingController.js';

const router = express.Router();

router.put('/onboarding/:id/approve', authenticate, hrOnly, approveOnboadingApplication);
router.put('/onboarding/:id/reject', authenticate, hrOnly, rejectOnboardingApplication);

export default router;
