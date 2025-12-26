import OPTDocument from '../models/OPTDocument.js';
import { getPresignedGetUrl } from '../config/aws.js';

const DOC_ORDER = ['RECEIPT', 'EAD', 'I-983', 'I-20'];
const I983_EMPTY_KEY = 'templates/i983-empty.pdf';
const I983_SAMPLE_KEY = 'templates/i983-sample.pdf';

function buildDocMap(docs) {
  const map = new Map();
  for (const doc of docs) map.set(doc.documentType, doc);
  return map;
}

function computeStatusPayload(docMap) {
  // Ensure all 4 exist in response (even if missing in DB)
  const documents = DOC_ORDER.map((t) => {
    const d = docMap.get(t);
    return {
      documentType: t,
      status: d?.status ?? null,
      uploaded: Boolean(d),
      feedback: d?.feedback || null,
      documentKey: d?.documentKey || null,
      updatedAt: d?.updatedAt || d?.createdAt || null,
    };
  });

  // Compute nextStep + message
  // Priority: any REJECTED => ask resubmission
  for (const t of DOC_ORDER) {
    const d = docMap.get(t);
    if (d?.status === 'REJECTED') {
      return {
        documents,
        nextAllowedUpload: t,
        message: `Your ${t} was rejected. Please check feedback and re-upload.`,
      };
    }
  }

  // Any PENDING => waiting HR on that doc
  for (const t of DOC_ORDER) {
    const d = docMap.get(t);
    if (d?.status === 'PENDING') {
      return {
        documents,
        nextAllowedUpload: t,
        message: `Waiting for HR to approve your ${t}.`,
      };
    }
  }

  // Find first not-uploaded => allow upload
  for (const t of DOC_ORDER) {
    const d = docMap.get(t);
    if (!d) {
      return {
        documents,
        nextAllowedUpload: t,
        message: `Please upload your ${t}.`,
      };
    }
  }

  //All approved
  return {
    documents,
    nextAllowedUpload: null,
    message: 'All documents have been approved.',
  };
}

export async function getVisaStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const docs = await OPTDocument.find({ userId }).lean();
    const docMap = buildDocMap(docs);

    const payload = computeStatusPayload(docMap);

    res.json({
      isOptCase: true,
      ...payload,
    });
  } catch (err) {
    next(err);
  }
}

export async function getI983Templates(req, res, next) {
  try {
    const emptyTemplateUrl = await getPresignedGetUrl({
      key: I983_EMPTY_KEY,
      expiresInSeconds: 60 * 10,
      responseContentDisposition: 'attachment; filename="I-983_Empty_Template.pdf"',
    });

    const sampleTemplateUrl = await getPresignedGetUrl({
      key: I983_SAMPLE_KEY,
      expiresInSeconds: 60 * 10,
      responseContentDisposition: 'attachment; filename="I-983_Sample_Template.pdf"',
    });

    return res.json({
      emptyTemplateUrl,
      sampleTemplateUrl,
    });
  } catch (err) {
    next(err);
  }
}
