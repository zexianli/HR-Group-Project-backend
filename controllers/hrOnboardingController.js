import mongoose from 'mongoose';
import OnboardingApplication from '../models/OnboardingApplication.js';

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * HP-75
 * GET /api/hr/onboarding?status=Pending|Rejected|Approved
 */
export async function getOnboardingApplications(req, res) {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status.toUpperCase();
    }

    const applications = await OnboardingApplication.find(filter)
      .populate('userId', 'username email role')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (err) {
    console.error('getOnboardingApplications error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * HP-75
 * GET /api/hr/onboarding/:id
 */
export async function getOnboardingApplicationById(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid onboarding application ID' });
    }

    const app = await OnboardingApplication.findById(id).populate(
      'userId',
      'username email role'
    );

    if (!app) {
      return res.status(404).json({ error: 'Onboarding application not found' });
    }

    return res.status(200).json({ onboardingApplication: app });
  } catch (err) {
    console.error('getOnboardingApplicationById error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * HP-87
 * PUT /api/hr/onboarding/:id/approve
 */
export async function approveOnboadingApplication(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid onboarding application ID' });
    }

    const app = await OnboardingApplication.findById(id);
    if (!app) {
      return res.status(404).json({ error: 'Onboarding application not found' });
    }

    if (app.status !== 'PENDING') {
      return res.status(409).json({
        error: `Cannot approve application with status ${app.status}`,
      });
    }

    app.status = 'APPROVED';
    app.feedback = '';
    app.reviewedAt = new Date();
    app.reviewedBy = req.user.id;

    await app.save();

    return res.status(200).json({
      message: 'Onboarding application approved',
      onboardingApplication: app,
    });
  } catch (err) {
    console.error('approveOnboardingApplication error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * HP-87
 * PUT /api/hr/onboarding/:id/reject
 */
export async function rejectOnboardingApplication(req, res) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid onboarding application ID' });
    }

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ error: 'Feedback is required when rejecting' });
    }

    const app = await OnboardingApplication.findById(id);
    if (!app) {
      return res.status(404).json({ error: 'Onboarding application not found' });
    }

    if (app.status !== 'PENDING') {
      return res.status(409).json({
        error: `Cannot reject application with status ${app.status}`,
      });
    }

    app.status = 'REJECTED';
    app.feedback = feedback.trim();
    app.reviewedAt = new Date();
    app.reviewedBy = req.user.id;

    await app.save();

    return res.status(200).json({
      message: 'Onboarding application rejected',
      onboardingApplication: app,
    });
  } catch (err) {
    console.error('rejectOnboardingApplication error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
