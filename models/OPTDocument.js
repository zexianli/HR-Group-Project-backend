import mongoose from "mongoose";

const OPTDocumentSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        employeeId: { type: String, ref: 'Employee', required: true },

        documentType: {
            type: String,
            enum: ['Receipt', 'EAD', 'I-983', 'I-20'],
            required: true,
        },

        documentURL: { type: String, required: true },

        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
            required: true,
        },

        feedback: { type: String, default: '' },
        reviewedBy: { type: String, ref: 'User', default: null }, // HR user
        reviewedAt: { type: Date, default: null },

        uploadedAt: { type: Date, default: () => new Date() },
        reviewedAt: { type: Date, default: null },

        version: { type: Number, default: 1 }, // incremented on each resubmission
    },
    { timestamps: true }
);
// Ensure unique combination of employeeId, documentType, and version
OPTDocumentSchema.index({ employeeId: 1, documentType: 1, version: -1 }, { unique: true });

export default mongoose.model('OPTDocument', OPTDocumentSchema);