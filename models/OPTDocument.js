import mongoose from 'mongoose';

const DOCUMENT_TYPES = [
  "OPT_RECEIPT",
  "OPT_EAD",
  "I_983",
  "I_20",
];

const DOCUMENT_STATUS = ["PENDING", "APPROVED", "REJECTED"];

const OPTDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    documentType: {
      type: String,
      enum: DOCUMENT_TYPES,
      required: true,
      index: true,
    },

    /**
     * S3 object key
     * Example: users/{userId}/opt/receipt_v2.pdf
     */
    documentKey: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: DOCUMENT_STATUS,
      default: "PENDING",
      required: true,
      index: true,
    },

    /**
     * Incremented on each resubmission
     * version = 1, 2, 3...
     */
    version: {
      type: Number,
      default: 1,
    },

    feedback: {
      type: String,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // HR
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Ensure uniqueness per submission version
 * Same user + same document type + same version cannot exist twice
 */
OPTDocumentSchema.index(
  { userId: 1, documentType: 1, version: 1 },
  { unique: true }
);

export default mongoose.model('OPTDocument', OPTDocumentSchema);
