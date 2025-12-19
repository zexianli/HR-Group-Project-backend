import mongoose from "mongoose";

const ReportThreadSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        createdBy: { type: String, ref: 'Employee', required: true },
        houseId: { type: String, ref: 'House', required: true },

        status: {
            type: String,
            enum: ['Open', 'In Review', 'Closed'],
            default: 'Open'
        },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
    },
    { timestamps: true } 
);

ReportThreadSchema.index({ houseId: 1, createdAt: -1 });

export default mongoose.model("ReportThread", ReportThreadSchema);