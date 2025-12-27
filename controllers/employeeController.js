import mongoose from 'mongoose';
import EmployeeProfile from '../models/EmployeeProfile.js';
import User from '../models/User.js';

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function ensureApprovedEmployee(userId) {
  const user = await User.findById(userId).select('onboardingStatus role isActive');
  if (!user) return { ok: false, status: 404, message: 'User not found' };
  if (!user.isActive) return { ok: false, status: 403, message: 'Account is inactive' };
  if (user.role !== 'EMPLOYEE')
    return { ok: false, status: 403, message: 'Employees only' };
  if (user.onboardingStatus !== 'APPROVED')
    return { ok: false, status: 403, message: 'Only approved employees can access this resource' };

  return { ok: true };
}

/**
 * GET /api/employees/me
 * HP-43: Returns the current user's complete employee profile
 * Only accessible to APPROVED employees
 */
export async function getMyEmployeeProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const gate = await ensureApprovedEmployee(userId);
    if (!gate.ok) return res.status(gate.status).json({ error: gate.message });

    const profile = await EmployeeProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    return res.status(200).json({ employeeProfile: profile });
  } catch (err) {
    console.error('getMyEmployeeProfile error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * PUT /api/employees/me
 * HP-44: Update current user's employee profile (specific sections only)
 * - Validates updated fields (via Mongoose validators)
 * - Only allows users to update their own profile
 * - Only accessible to APPROVED employees
 */
export async function updateMyEmployeeProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const gate = await ensureApprovedEmployee(userId);
    if (!gate.ok) return res.status(gate.status).json({ error: gate.message });

    // Whitelist: only allow updating specific sections/fields
    const allowedTopLevel = new Set([
      // Name
      'firstName',
      'lastName',
      'middleName',
      'preferredName',

      // Address & contact
      'address',
      'cellPhone',
      'workPhone',

      // Optional
      'carInformation',
      'reference',
      'emergencyContacts',

      // profile picture key (stored after S3 upload)
      'profilePictureKey',
    ]);

    const updates = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      if (allowedTopLevel.has(key)) updates[key] = value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
      });
    }

    // Ensure profile exists
    const existing = await EmployeeProfile.findOne({ userId });
    if (!existing) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const updatedProfile = await EmployeeProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Employee profile updated successfully',
      employeeProfile: updatedProfile,
    });
  } catch (err) {
    console.error('updateMyEmployeeProfile error:', err);

    // Mongoose validation errors
    if (err?.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.message,
      });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
