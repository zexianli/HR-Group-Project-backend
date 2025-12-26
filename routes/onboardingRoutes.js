import express from 'express';
import { authenticate, employeeOnly } from '../middlewares/auth.js';
import { validateOnboarding } from '../middlewares/validateOnboarding.js';
import {
  submitOnboarding,
  getOnboardingApplication,
  updateRejectedOnboarding,
} from '../controllers/onboardingController.js';

const router = express.Router();

/**
 * GET /api/onboarding
 * Get current user's onboarding info
 */
router.get(
  '/',
  authenticate,
  employeeOnly,
  getOnboardingApplication
);

/**
 * POST /api/onboarding
 * Initial onboarding submission
 */
router.post(
  '/',
  authenticate,
  employeeOnly,
  validateOnboarding,
  submitOnboarding
);

/**
 * PUT /api/onboarding
 * Update onboarding only when status is REJECTED
 */
router.put(
  '/',
  authenticate,
  employeeOnly,
  validateOnboarding,
  updateRejectedOnboarding
);

export default router;
