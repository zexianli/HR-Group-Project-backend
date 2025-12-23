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

    fileUrl: {
      type: String,
      required: true, // S3 URL
    },

    status: {
      type: String,
      enum: DOCUMENT_STATUS,
      default: "PENDING",
      required: true,
      index: true,
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

    version: {
      type: Number,
      default: 1,
    },

    isLatest: {
      type: Boolean,
      default: true,
      index: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

OPTDocumentSchema.index(
  { userId: 1, documentType: 1, isLatest: 1 },
  { unique: true }
);

export default mongoose.model('OPTDocument', OPTDocumentSchema);
