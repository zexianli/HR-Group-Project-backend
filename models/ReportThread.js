import mongoose from 'mongoose';

const { Schema } = mongoose;

const REPORT_STATUS = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

const ReportThreadSchema = new Schema(
  {
    houseId: {
      type: Schema.Types.ObjectId,
      ref: 'House',
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: REPORT_STATUS,
      default: 'OPEN',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ReportThreadSchema.index({ houseId: 1, createdAt: -1 });

export default mongoose.model('ReportThread', ReportThreadSchema);
