import mongoose from 'mongoose';
import EmployeeProfile from '../models/EmployeeProfile.js';
import User from '../models/User.js';
import OnboardingApplication from '../models/OnboardingApplication.js';

// convert 'YYYY-MM-DD' to Date object in UTC
function ymdToUTCDate(ymd) {
  if (!ymd) return null;
  return new Date(`${ymd}T00:00:00.000Z`);
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
