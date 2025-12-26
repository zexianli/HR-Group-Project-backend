import EmployeeProfile from '../models/EmployeeProfile.js';

/**
 * Only allow visa-management if employee's workAuthorizationType === 'F1_CPT_OPT'
 * - For employee endpoints: check req.user.id
 * - For HR endpoints that target an employee: check req.params.employeeId.
 */
export async function requireOptVisaCase(req, res, next) {
  try {
    /**
     * Decide whose visa case we are checking:
     * - Employee endpoint: req.user.id
     * - HR endpoint: req.params.employeeId
     */
    const targetUserId = req.params?.employeeId || req.user?.id;
    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    const profile = await EmployeeProfile.findOne({ userId: targetUserId }).lean();
    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    if (profile.workAuthorizationType !== 'F1_CPT_OPT') {
      return res.status(403).json({ message: 'Operation allowed only for F1 CPT/OPT visa cases' });
    }

    // Attach targetUserId and profile to req for downstream handlers
    req.targetUserId = targetUserId;
    req.employeeProfile = profile;
    next();
  } catch (err) {
    next(err);
  }
}
