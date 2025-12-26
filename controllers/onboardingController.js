import mongoose from 'mongoose';
import EmployeeProfile from '../models/EmployeeProfile.js';
import User from '../models/User.js';
import OnboardingApplication from '../models/OnboardingApplication.js';

// convert 'YYYY-MM-DD' to Date object in UTC
function ymdToUTCDate(ymd) {
  if (!ymd) return null;
  return new Date(`${ymd}T00:00:00.000Z`);
}

/**
 * GET /api/onboarding
 * Employee only
 */
export async function getOnboardingApplication(req, res) {
  try {
    const userId = req.user.id;

    const [profile, onboarding] = await Promise.all([
      EmployeeProfile.findOne({ userId }),
      OnboardingApplication.findOne({ userId }),
    ]);

    if (!profile || !onboarding) {
      return res.status(404).json({
        error: 'Onboarding information not found',
      });
    }

    return res.status(200).json({
      employeeProfile: profile,
      onboarding: {
        status: onboarding.status,
        feedback: onboarding.feedback,
      },
    });
  } catch (err) {
    console.error('getOnboardingApplication error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * PUT /api/onboarding
 * Only allowed when status === REJECTED
 */
export async function updateRejectedOnboarding(req, res) {
  try {
    const userId = req.user.id;
    const data = req.validatedBody; // reuse validateOnboarding

    const onboarding = await OnboardingApplication.findOne({ userId });

    if (!onboarding) {
      return res.status(404).json({
        error: 'Onboarding application not found',
      });
    }

    if (onboarding.status !== 'REJECTED') {
      return res.status(403).json({
        error: 'Onboarding can only be updated when status is REJECTED',
      });
    }

    // Update employee profile
    await EmployeeProfile.findOneAndUpdate(
      { userId },
      data,
      { new: true, runValidators: true }
    );

    // Update onboarding workflow
    onboarding.status = 'PENDING';
    onboarding.feedback = '';
    onboarding.snapshot = data;
    onboarding.submittedAt = new Date();

    await onboarding.save();

    return res.status(200).json({
      message: 'Onboarding application resubmitted successfully',
      onboardingStatus: 'PENDING',
    });
  } catch (err) {
    console.error('updateRejectedOnboarding error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


export async function submitOnboarding(req, res) {
  try {
    const userId = req.user?.id; // from auth middleware
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const data = req.validatedBody; // from validateOnboarding middleware
    const normalized = {
      ...data,
      dateOfBirth: ymdToUTCDate(data.dateOfBirth),
      workAuthorizationStart: ymdToUTCDate(data.workAuthorizationStart),
      workAuthorizationEnd: ymdToUTCDate(data.workAuthorizationEnd),

      driverLicense: data.driverLicense
        ? {
            ...data.driverLicense,
            expirationDate: ymdToUTCDate(data.driverLicense.expirationDate),
          }
        : undefined,
    };

    let profile = await EmployeeProfile.findOne({ userId });
    if (!profile) {
      profile = new EmployeeProfile({ userId, ...normalized });
    } else {
      Object.assign(profile, normalized);
    }
    await profile.save();

    await User.updateOne({ _id: userId }, { $set: { onboardingStatus: 'PENDING' } });

    let app = await OnboardingApplication.findOne({ userId });
    if (!app) {
      app = new OnboardingApplication({ userId });
    }

    app.status = 'PENDING';
    app.snapshot = data; // save a snapshot of the submitted data in original format
    await app.save();

    return res.status(200).json({
      employeeProfile: profile,
      onboardingStatus: 'PENDING',
    });
  } catch (err) {
    console.error('submitOnboarding error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
