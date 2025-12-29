import EmployeeProfile from '../models/EmployeeProfile.js';
import OPTDocument from '../models/OPTDocument.js';
import User from '../models/User.js';
import { DOC_ORDER } from './uploadController.js';
import { sendVisaDocumentReminderEmail } from '../utils/emailService.js';

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
          documentId: d._id,
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

export async function reviewDocument(req, res) {
  try {
    const { documentId, action, feedback } = req.body;
    const hrUserId = req.user.id;

    if (!documentId) {
      return res.status(400).json({
        message: 'Document ID is required',
      });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be "approve" or "reject"',
      });
    }

    if (action === 'reject' && (!feedback || feedback.trim() === '')) {
      return res.status(400).json({
        message: 'Feedback is required when rejecting a document',
      });
    }

    const document = await OPTDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({
        message: 'Document not found',
      });
    }

    const updateData = {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      reviewedBy: hrUserId,
      reviewedAt: new Date(),
    };

    if (action === 'approve') {
      updateData.feedback = '';
    } else {
      updateData.feedback = feedback.trim();
    }

    const updatedDocument = await OPTDocument.findByIdAndUpdate(
      documentId,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      message: `Document ${action}d successfully`,
      data: {
        documentId: updatedDocument._id,
        documentType: updatedDocument.documentType,
        status: updatedDocument.status,
        feedback: updatedDocument.feedback,
        reviewedBy: updatedDocument.reviewedBy,
        reviewedAt: updatedDocument.reviewedAt,
      },
    });
  } catch (error) {
    console.error('Error reviewing document:', error);
    return res.status(500).json({
      message: 'An error occurred while reviewing the document',
      error: error.message,
    });
  }
}

export async function notifyEmployee(req, res) {
  try {
    const { employeeId } = req.params;

    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    const employeeProfile = await EmployeeProfile.findOne({ userId: employeeId });
    if (!employeeProfile) {
      return res.status(404).json({
        message: 'Employee profile not found',
      });
    }

    if (employeeProfile.workAuthorizationType !== 'F1_CPT_OPT') {
      return res.status(400).json({
        message: 'Employee does not have F1_CPT_OPT work authorization',
      });
    }

    const docs = await OPTDocument.find({ userId: employeeId }).lean();
    const docMap = new Map(docs.map((d) => [d.documentType, d]));

    let nextDocumentType = null;
    let action = 'upload';

    for (const t of DOC_ORDER) {
      const d = docMap.get(t);
      if (d?.status === 'REJECTED') {
        nextDocumentType = t;
        action = 'reupload';
        break;
      }
    }

    // If no rejected, check for missing documents
    if (!nextDocumentType) {
      for (const t of DOC_ORDER) {
        const d = docMap.get(t);
        if (!d) {
          nextDocumentType = t;
          action = 'upload';
          break;
        }
      }
    }

    if (!nextDocumentType) {
      return res.status(400).json({
        message: 'No action required. All documents are uploaded and approved or pending review.',
      });
    }

    const employeeName = employeeProfile.preferredName || employeeProfile.firstName;
    await sendVisaDocumentReminderEmail({
      to: user.email,
      name: employeeName,
      documentType: nextDocumentType,
      action,
    });

    return res.status(200).json({
      message: 'Notification sent successfully',
      data: {
        employeeId,
        employeeName,
        email: user.email,
        documentType: nextDocumentType,
        action,
      },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      message: 'An error occurred while sending notification',
      error: error.message,
    });
  }
}
