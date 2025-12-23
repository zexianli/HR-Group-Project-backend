import EmployeeProfile from '../models/EmployeeProfile.js';
import OPTDocument from '../models/OPTDocument.js';
import { uploadToS3 } from '../config/aws.js';

function extFromMimetype(mimi) {
  if (mimi === 'image/jpeg') return 'jpg';
  if (mimi === 'image/png') return 'png';
  if (mimi === 'application/pdf') return 'pdf';
  return 'bin';
}

/**
 * Expected multipart from-data:
 * - file: (pdf/jpg/png, <= 5MB)
 * - docType: one of:
 *      profile_picture | driver_license | opt_receipt | opt_ead | i983 | i20
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

    const userId = req.userId; // from auth middleware
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
        opt_receipt: 'RECEIPT',
        opt_ead: 'EAD',
        i983: 'I-983',
        i20: 'I-20',
      };

      const documentType = map[docType];
      await OPTDocument.updateOne(
        { _id: `${userId}:${documentType}` },
        {
          $set: {
            _id: `${userId}:${documentType}`,
            employeeId: String(userId),
            documentType,
            documentKey: key,
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
