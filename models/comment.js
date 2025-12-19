import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        reportId: { type: String, ref: 'ReportThread', required: true },
        message: { type: String, required: true },

        createdBy: { type: String, ref: 'User', required: true },
    },
    { timestamps: true }
);

CommentSchema.index({ reportId: 1, createdAt: 1 });

export default mongoose.model("Comment", CommentSchema);