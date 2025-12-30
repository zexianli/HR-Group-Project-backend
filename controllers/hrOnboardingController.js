import mongoose from 'mongoose';
import OnboardingApplication from '../models/OnboardingApplication.js';
import User from '../models/User.js';

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

    const app = await OnboardingApplication.findById(id).populate('userId', 'username email role');

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
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid onboarding application ID' });
  }

  let session;
  try {
    session = await mongoose.startSession();

    // Transection to keep app + user in sync atomically.
    let updatedApp;
    await session.withTransaction(async () => {
      const app = await OnboardingApplication.findById(id).session(session);
      if (!app) {
        throw Object.assign(new Error('NOT_FOUND_APP'), { statusCode: 404 });
      }

      if (app.status !== 'PENDING') {
        throw Object.assign(new Error(`Cannot approve application with status ${app.status}`), {
          statusCode: 409,
        });
      }

      const user = await User.findById(app.userId).session(session);
      if (!user) {
        throw Object.assign(new Error('NOT_FOUND_USER'), { statusCode: 404 });
      }

      app.status = 'APPROVED';
      app.feedback = '';
      app.reviewedAt = new Date();
      app.reviewedBy = req.user.id;

      user.onboardingStatus = 'APPROVED';

      await Promise.all([app.save({ session }), user.save({ session })]);
      updatedApp = app;
    });

    return res.status(200).json({
      message: 'Onboarding application approved',
      onboardingApplication: updatedApp,
    });
  } catch (err) {
    // Fallback: if transactions aren’t supported, do sequential updates
    if (
      err?.message?.includes('Transaction') ||
      err?.message?.includes('transactions') ||
      err?.code === 20 // some mongo environments
    ) {
      try {
        const app = await OnboardingApplication.findById(id);
        if (!app) return res.status(404).json({ error: 'Onboarding application not found' });
        if (app.status !== 'PENDING') {
          return res
            .status(409)
            .json({ error: `Cannot approve application with status ${app.status}` });
        }

        const user = await User.findById(app.userId);
        if (!user) return res.status(404).json({ error: 'User not found for this application' });

        app.status = 'APPROVED';
        app.feedback = '';
        app.reviewedAt = new Date();
        app.reviewedBy = req.user.id;

        user.onboardingStatus = 'APPROVED';

        await app.save();
        await user.save();

        return res.status(200).json({
          message: 'Onboarding application approved',
          onboardingApplication: app,
        });
      } catch (fallbackErr) {
        console.error('approveOnboardingApplication fallback error:', fallbackErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    if (err?.statusCode) {
      return res.status(err.statusCode).json({
        error:
          err.message === 'NOT_FOUND_APP'
            ? 'Onboarding application not found'
            : err.message === 'NOT_FOUND_USER'
              ? 'User not found for this application'
              : err.message,
      });
    }

    console.error('approveOnboardingApplication error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (session) session.endSession();
  }
}

/**
 * HP-87
 * PUT /api/hr/onboarding/:id/reject
 */
export async function rejectOnboardingApplication(req, res) {
  const { id } = req.params;
  const { feedback } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid onboarding application ID' });
  }

  if (!feedback || !feedback.trim()) {
    return res.status(400).json({ error: 'Feedback is required when rejecting' });
  }

  let session;
  try {
    session = await mongoose.startSession();

    let updatedApp;
    await session.withTransaction(async () => {
      const app = await OnboardingApplication.findById(id).session(session);
      if (!app) {
        throw Object.assign(new Error('NOT_FOUND_APP'), { statusCode: 404 });
      }

      if (app.status !== 'PENDING') {
        throw Object.assign(new Error(`Cannot reject application with status ${app.status}`), {
          statusCode: 409,
        });
      }

      const user = await User.findById(app.userId).session(session);
      if (!user) {
        throw Object.assign(new Error('NOT_FOUND_USER'), { statusCode: 404 });
      }

      app.status = 'REJECTED';
      app.feedback = feedback.trim();
      app.reviewedAt = new Date();
      app.reviewedBy = req.user.id;

      user.onboardingStatus = 'REJECTED';

      await Promise.all([app.save({ session }), user.save({ session })]);
      updatedApp = app;
    });

    return res.status(200).json({
      message: 'Onboarding application rejected',
      onboardingApplication: updatedApp,
    });
  } catch (err) {
    // Fallback: no transactions
    if (
      err?.message?.includes('Transaction') ||
      err?.message?.includes('transactions') ||
      err?.code === 20
    ) {
      try {
        const app = await OnboardingApplication.findById(id);
        if (!app) return res.status(404).json({ error: 'Onboarding application not found' });
        if (app.status !== 'PENDING') {
          return res
            .status(409)
            .json({ error: `Cannot reject application with status ${app.status}` });
        }

        const user = await User.findById(app.userId);
        if (!user) return res.status(404).json({ error: 'User not found for this application' });

        app.status = 'REJECTED';
        app.feedback = feedback.trim();
        app.reviewedAt = new Date();
        app.reviewedBy = req.user.id;

        user.onboardingStatus = 'REJECTED';

        await app.save();
        await user.save();

        return res.status(200).json({
          message: 'Onboarding application rejected',
          onboardingApplication: app,
        });
      } catch (fallbackErr) {
        console.error('rejectOnboardingApplication fallback error:', fallbackErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    if (err?.statusCode) {
      return res.status(err.statusCode).json({
        error:
          err.message === 'NOT_FOUND_APP'
            ? 'Onboarding application not found'
            : err.message === 'NOT_FOUND_USER'
              ? 'User not found for this application'
              : err.message,
      });
    }

    console.error('rejectOnboardingApplication error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (session) session.endSession();
  }
}
