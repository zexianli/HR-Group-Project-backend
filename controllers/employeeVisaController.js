import OPTDocument from '../models/OPTDocument.js';
import { getPresignedGetUrl } from '../config/aws.js';
import { DOC_ORDER } from './uploadController.js';

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

export async function getVisaStatus(req, res) {
  try {
    const userId = req.user.id;
    const docs = await OPTDocument.find({ userId }).lean();
    const docMap = buildDocMap(docs);

    const payload = computeStatusPayload(docMap);

    res.status(200).json({
      isOptCase: true,
      ...payload,
    });
  } catch (error) {
    console.error('Error fetching visa status:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching visa status',
      error: error.message,
    });
  }
}

export async function getI983Templates(req, res) {
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
  } catch (error) {
    return res.status(500).json({
      message: 'An error occurred while returning I983 Template',
      error: error.message,
    });
  }
}

export async function getUploadedDocuments(req, res) {
  try {
    const userId = req.user.id;

    const documents = await OPTDocument.find({ userId })
      .select('documentType status documentKey feedback createdAt updatedAt reviewedAt reviewedBy')
      .lean();

    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        let downloadUrl = null;
        if (doc.documentKey) {
          try {
            downloadUrl = await getPresignedGetUrl({
              key: doc.documentKey,
              expiresInSeconds: 60 * 10,
            });
          } catch (error) {
            console.error(`Error generating presigned URL for ${doc.documentKey}:`, error);
          }
        }

        return {
          id: doc._id,
          documentType: doc.documentType,
          status: doc.status,
          feedback: doc.feedback,
          uploadedAt: doc.createdAt,
          reviewedAt: doc.reviewedAt,
          downloadUrl,
        };
      })
    );

    return res.status(200).json({
      message: 'Documents retrieved successfully',
      data: documentsWithUrls,
    });
  } catch (error) {
    console.error('Error fetching uploaded documents:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching uploaded documents',
      error: error.message,
    });
  }
}
