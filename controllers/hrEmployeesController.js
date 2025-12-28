import mongoose from 'mongoose';
import User from '../models/User.js';
import EmployeeProfile from '../models/EmployeeProfile.js';

export async function getAllEmployeesSummary(req, res) {
  try {
    const profiles = await EmployeeProfile.find({}).sort({ lastName: 1, firstName: 1 }).lean();

    const totalCount = profiles.length;

    const userIds = profiles.map((p) => p.userId).filter(Boolean);

    // pull user emails (and username)
    const users = await User.find({ _id: { $in: userIds } })
      .select('email username')
      .lean();

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const employees = profiles.map((p) => {
      const u = userMap.get(String(p.userId));

      const name = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
      const phone = p.cellPhone || p.workPhone || '';
      const workAuthorizationTitle =
        p.workAuthorizationType === 'OTHER' && p.otherWorkAuthorizationTitle
          ? p.otherWorkAuthorizationTitle
          : p.workAuthorizationType || '';

      return {
        id: p._id, // profile doc id
        userId: p.userId, // user account id
        name,
        ssn: p.ssn || '',
        workAuthorizationTitle,
        phone,
        email: u?.email || '',
        username: u?.username || '',
      };
    });

    return res.json({ totalCount, employees });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

export async function getEmployeeProfileById(req, res) {
  try {
    const { id } = req.params;

    let profile = null;

    // Try as EmployeeProfile _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      profile = await EmployeeProfile.findById(id).lean();
    }

    // Fallback: try as userId
    if (!profile && mongoose.Types.ObjectId.isValid(id)) {
      profile = await EmployeeProfile.findOne({ userId: id }).lean();
    }

    if (!profile) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    return res.json({ employee: profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
