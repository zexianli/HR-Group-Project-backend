import mongoose from "mongoose";

const ONBOARDING_STATUS = [
  "NOT_STARTED",
  "PENDING",
  "APPROVED",
  "REJECTED",
];

const OnboardingApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ONBOARDING_STATUS,
      default: "NOT_STARTED",
      required: true,
      index: true,
    },

    feedback: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // HR
      default: null,
    },

    // Immutable snapshot of submitted data
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "OnboardingApplication",
  OnboardingApplicationSchema
);
