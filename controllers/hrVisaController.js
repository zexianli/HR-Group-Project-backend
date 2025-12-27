import EmployeeProfile from '../models/EmployeeProfile.js';
import OPTDocument from '../models/OPTDocument.js';
import { DOC_ORDER } from './uploadController.js';

function daysRemaining(endDate) {
  if (!endDate) return null;
  const now = new Date();
  // Time left in milliseconds
  const diffMs = new Date(endDate).getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function computeNextStep(docMap) {
  // If any REJECTED => request Resubmission
  for (const t of DOC_ORDER) {
    const d = docMap.get(t);
    if (d?.status === 'REJECTED') {
      return {
        nextStep: `Employee must re-upload ${t}`,
        actionType: 'SEND_NOTIFICATION',
        pendingDocument: null,
      };
    }
  }

  // If any PENDING: HR needs to review the doc
  for (const t of DOC_ORDER) {
    const d = docMap.get(t);
    if (d?.status === 'PENDING') {
      return {
        nextStep: `Waiting for HR approval: ${t}`,
        actionType: 'REVIEW_DOC',
        pendingDocument: {
          documentType: t,
          status: d.status,
          documentKey: d.documentKey,
          uploadedAt: d.createdAt ?? null,
        },
      };
    }
  }

  // First Missing doc => employee needs to upload
  for (const t of DOC_ORDER) {
    const d = docMap.get(t);
    if (!d) {
      return {
        nextStep: `Employee needs to upload ${t}`,
        actionType: 'SEND_NOTIFICATION',
        pendingDocument: null,
      };
    }
  }

  // All approved => not "in-progress"
  return null;
}

export async function getPendingOptEmployees(req, res) {
  try {
    const profiles = await EmployeeProfile.find({ workAuthorizationType: 'F1_CPT_OPT' })
      .select(
        'userId firstName lastName preferredName workAuthorizationType workAuthorizationStart workAuthorizationEnd'
      )
      .lean();
    if (!profiles.length) {
      return res.json({ employees: [] });
    }
    const userIds = profiles.map((p) => p.userId);
    const docs = await OPTDocument.find({ userId: { $in: userIds } }).lean();

    // Group docs by userId
    const docsByUser = new Map();
    for (const d of docs) {
      const id = String(d.userId);
      if (!docsByUser.has(id)) docsByUser.set(id, []);
      docsByUser.get(id).push(d);
    }

    const employees = [];

    for (const p of profiles) {
      const userKey = String(p.userId);
      const userDocs = docsByUser.get(userKey) || [];

      // Map by documentType, should be at most 1 per type
      const docMap = new Map(userDocs.map((d) => [d.documentType, d]));

      const step = computeNextStep(docMap);
      if (!step) continue; // all approved => not in "in-progress"

      employees.push({
        employeeId: p.userId,
        name: {
          firstName: p.firstName,
          lastName: p.lastName,
          preferredName: p.preferredName,
          legalFullName: `${p.firstName} ${p.lastName}`,
        },
        workAuthorization: {
          title: p.workAuthorizationType,
          startDate: p.workAuthorizationStart,
          endDate: p.workAuthorizationEnd,
          daysRemaining: daysRemaining(p.workAuthorizationEnd),
        },
        nextStep: step.nextStep,
        actionType: step.actionType,
        pendingDocument: step.pendingDocument,
      });
    }

    return res.json({ employees });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || 'Internal Server Error when getting Employees' });
  }
}

export async function getAllVisaStatusEmployees(req, res) {
  try {
    const search = (req.query.search || '').trim();

    // Build optional name filter
    const nameFilter = search
      ? {
          $or: [
            // case-insensitive
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { preferredName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const profiles = await EmployeeProfile.find({
      workAuthorizationType: 'F1_CPT_OPT',
      ...nameFilter,
    })
      .select(
        'userId firstName lastName preferredName workAuthorizationType workAuthorizationStart workAuthorizationEnd'
      )
      .lean();

    if (!profiles.length) return res.json({ employees: [] });

    const userIds = profiles.map((p) => p.userId);
    const docs = await OPTDocument.find({ userId: { $in: userIds } }).lean();

    const docsByUser = new Map();
    for (const d of docs) {
      const id = String(d.userId);
      if (!docsByUser.has(id)) docsByUser.set(id, []);
      docsByUser.get(id).push(d);
    }

    // Build Response
    const employees = profiles.map((p) => {
      const userKey = String(p.userId);
      const userDocs = docsByUser.get(userKey) || [];

      const docMap = new Map(userDocs.map((d) => [d.documentType, d]));
      const nextStep = computeNextStep(docMap);

      // All uploaded and approved docs
      const approvedDocuments = userDocs
        .filter((d) => d.status === 'APPROVED')
        .map((d) => ({
          documentType: d.documentType,
          status: d.status,
          documentKey: d.documentKey,
          uoloadedAt: d.createdAt ?? null,
          reviewedAt: d.updatedAt ?? null,
        }));
      return {
        employeeId: p.userId,
        name: {
          firstName: p.firstName,
          lastName: p.lastName,
          preferredName: p.preferredName,
          legalFullName: `${p.firstName} ${p.lastName}`,
        },
        workAuthorization: {
          title: p.workAuthorizationType,
          startDate: p.workAuthorizationStart,
          endDate: p.workAuthorizationEnd,
          daysRemaining: daysRemaining(p.workAuthorizationEnd),
        },
        nextStep,
        approvedDocuments,
      };
    });

    return res.json({ employees });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || 'Internal Server Error when getting Employees' });
  }
}
