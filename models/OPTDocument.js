import mongoose from 'mongoose';

const OPTDocumentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    employeeId: { type: String, ref: 'Employee', required: true },

    documentType: {
      type: String,
      enum: ['RECEIPT', 'EAD', 'I-983', 'I-20'],
      required: true,
    },

    documentKey: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },

    feedback: { type: String, default: '' },
    reviewedBy: { type: String, ref: 'User', default: null }, // HR user
    reviewedAt: { type: Date, default: null },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);
// Ensure unique combination of employeeId, documentType, and version
OPTDocumentSchema.index({ employeeId: 1, documentType: 1 }, { unique: true });

export default mongoose.model('OPTDocument', OPTDocumentSchema);
