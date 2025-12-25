import mongoose from 'mongoose';
import OnboardingApplication from '../models/OnboardingApplication.js';

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

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
        error: `Cannot approve an application with status: ${app.status}`,
      });
    }

    app.status = 'APPROVED';
    app.feedback = '';
    app.reviewedAt = new Date();
    app.reviewedBy = req.user?.id ?? null;

    await app.save();

    return res.status(200).json({
      message: 'Onboarding application approved successfully',
      onboardingApplication: app,
    });
  } catch (err) {
    console.error('approveOnboardingApplication error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function rejectOnboardingApplication(req, res) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid onboarding application ID' });
    }

    const trimmed = typeof feedback === 'string' ? feedback.trim() : '';
    if (!trimmed) {
      return res.status(400).json({ error: 'Feedback cannot be empty' });
    }
    const app = await OnboardingApplication.findById(id);
    if (!app) {
      return res.status(404).json({ error: 'Onboarding application not found' });
    }
    if (app.status !== 'PENDING') {
      return res.status(409).json({
        error: `Cannot reject an application with status: ${app.status}`,
      });
    }
    app.status = 'REJECTED';
    app.feedback = trimmed;
    app.reviewedAt = new Date();
    app.reviewedBy = req.user?.id ?? null;

    await app.save();

    return res.status(200).json({
      message: 'Onboarding application rejected successfully',
      onboardingApplication: app,
    });
  } catch (err) {
    console.error('rejectOnboardingApplication error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
