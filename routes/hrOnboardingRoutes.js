import express from 'express';
import { authenticate, hrOnly } from '../middlewares/auth.js';
import {
  getOnboardingApplications,
  getOnboardingApplicationById,
  approveOnboadingApplication,
  rejectOnboardingApplication,
} from '../controllers/hrOnboardingController.js';

const router = express.Router();

router.use(authenticate, hrOnly);

// HP-75
router.get('/onboarding', getOnboardingApplications);
router.get('/onboarding/:id', getOnboardingApplicationById);

// HP-87
router.put('/onboarding/:id/approve', approveOnboadingApplication);
router.put('/onboarding/:id/reject', rejectOnboardingApplication);

export default router;
