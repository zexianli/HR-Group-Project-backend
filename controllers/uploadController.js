import EmployeeProfile from '../models/EmployeeProfile.js';
import OPTDocument from '../models/OPTDocument.js';
import { uploadToS3, getPresignedGetUrl } from '../config/aws.js';

function extFromMimetype(mimi) {
  if (mimi === 'image/jpeg') return 'jpg';
  if (mimi === 'image/png') return 'png';
  if (mimi === 'application/pdf') return 'pdf';
  return 'bin';
}

export const DOC_ORDER = ['OPT_RECEIPT', 'OPT_EAD', 'I_983', 'I_20'];

async function getNextAllowedDocType(userId) {
  const docs = await OPTDocument.find({ userId }).lean();
  const statusByType = new Map();

  // build a map of documentType -> status
  for (const doc of docs) {
    statusByType.set(doc.documentType, doc.status);
  }

  for (const t of DOC_ORDER) {
    const status = statusByType.get(t);
    if (status !== 'APPROVED') {
      return t;
    }
  }
  return null; // all approved
}
/**
 * Expected multipart from-data:
 * - file: (pdf/jpg/png, <= 5MB)
 * - docType: one of:
 *      profile_picture | driver_license | green_card | citizen | opt_RECEIPT | opt_ead | i983 | i20
 */
export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const docType = (req.body.docType || '').toLowerCase().trim();
    if (!docType) {
      return res.status(400).json({ error: 'Invalid or missing docType' });
    }

    const userId = req.user?.id; // from auth middleware
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const ext = extFromMimetype(req.file.mimetype);

    // overwrite keys
    let s3Key;

    switch (docType) {
      case 'profile_picture':
        s3Key = `users/${userId}/profile_picture.${ext}`;
        break;
      case 'driver_license':
        s3Key = `users/${userId}/driver_license.${ext}`;
        break;
      case 'green_card':
        s3Key = `users/${userId}/green_card.${ext}`;
        break;
      case 'citizen':
        s3Key = `users/${userId}/citizen.${ext}`;
        break;
      case 'opt_receipt':
        s3Key = `users/${userId}/opt_receipt.${ext}`;
        break;
      case 'opt_ead':
        s3Key = `users/${userId}/opt_ead.${ext}`;
        break;
      case 'i983':
        s3Key = `users/${userId}/i983.${ext}`;
        break;
      case 'i20':
        s3Key = `users/${userId}/i20.${ext}`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid docType' });
    }

    const { url, key, bucket } = await uploadToS3({
      body: req.file.buffer,
      key: s3Key,
      contentType: req.file.mimetype,
    });

    if (docType === 'driver_license') {
      const r = await EmployeeProfile.updateOne(
        { userId },
        { $set: { driverLicenseDocKey: key } },
        { upsert: false }
      );
      if (r.matchedCount === 0) {
        return res.status(404).json({ error: 'EmployeeProfile not found for this userId' });
      }
    } else if (docType === 'profile_picture') {
      const r = await EmployeeProfile.updateOne(
        { userId },
        { $set: { profilePictureKey: key } },
        { upsert: false }
      );
      if (r.matchedCount === 0) {
        return res.status(404).json({ error: 'EmployeeProfile not found for this userId' });
      }
    } else {
      const map = {
        opt_receipt: 'OPT_RECEIPT',
        opt_ead: 'OPT_EAD',
        i983: 'I_983',
        i20: 'I_20',
      };

      const documentType = map[docType];
      if (!documentType) {
        return res.status(400).json({ error: 'Invalid docType' });
      }

      const nextAllowed = await getNextAllowedDocType(userId);
      if (!nextAllowed) {
        return res.status(400).json({ error: 'All OPT documents have been approved already' });
      }
      if (documentType !== nextAllowed) {
        return res.status(400).json({
          error: `You must have ${nextAllowed} APPROVED before uploading ${documentType}.`,
          nextAllowed,
        });
      }

      await OPTDocument.updateOne(
        { userId, documentType },
        {
          $set: {
            userId,
            documentType,
            documentKey: key,
            status: 'PENDING',
            feedback: null,
          },
        },
        { upsert: true }
      );
    }

    return res.status(201).json({ url, key, bucket, docType });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).send({ error: 'File too large. Max size is 5MB.' });
    }
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
}

export async function getPresignedPreviewUrl(req, res) {
  try {
    const userId = req.user?.id; // from auth middleware
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const docType = (req.query.docType || '').toLowerCase().trim();
    if (!docType) {
      return res.status(400).json({ error: 'Invalid or missing docType' });
    }

    let key = null;

    if (docType === 'driver_license' || docType === 'profile_picture') {
      const profile = await EmployeeProfile.findOne({ userId });
      if (!profile)
        return res.status(404).json({ error: 'EmployeeProfile not found for this userId' });

      if (docType === 'driver_license') {
        key = profile.driverLicenseDocKey;
      } else if (docType === 'profile_picture') {
        key = profile.profilePictureKey;
      }
    } else {
      const map = {
        opt_receipt: 'OPT_RECEIPT',
        opt_ead: 'OPT_EAD',
        i983: 'I_983',
        i20: 'I_20',
      };
      const documentType = map[docType];
      if (!documentType) {
        return res.status(400).json({ error: 'Invalid docType' });
      }
      const doc = await OPTDocument.findOne({ userId, documentType }).lean();
      if (!doc?.documentKey) return res.status(404).json({ error: 'Document not found' });
      key = doc.documentKey;
    }
    if (!key) return res.status(404).json({ error: 'No document key found' });

    const url = await getPresignedGetUrl({
      key,
      expiresInSeconds: 60 * 10, // 10 minutes
      // inline makes the browser display the file inline (e.g. image in a new tab)
      responseContentDisposition: 'inline',
    });

    return res.json({ url, key });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to generate preview URL' });
  }
}
