import mongoose from "mongoose";

const ROLES = ["HR", "EMPLOYEE"];

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "EMPLOYEE",
      required: true,
      index: true,
    },
    onboardingStatus: {
      type: String,
      enum: ["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_STARTED",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
