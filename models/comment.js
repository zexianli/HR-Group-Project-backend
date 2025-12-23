import mongoose from 'mongoose';

const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'ReportThread',
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ reportId: 1, createdAt: 1 });

export default mongoose.model('Comment', CommentSchema);
