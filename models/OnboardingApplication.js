import mongoose from "mongoose";

const OnboardingApplicationSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // UUID
        employeeId: { type: String, ref: 'Employee', required: true }, // Reference to Employee model

        status : {
            type: String,
            enum: ["Not Started", "Pending", "Approved", "Rejected"],
            default: "Not Started",
            required: true,
        },
        feedback: { type: String, default: '' },
        submittedAt: { type: Date, default: null },
        reviewedAt: { type: Date, default: null },
        reviewedBy: { type: String, ref: 'User', default: null }, // HR user

        // Store a snapshot of the employee's data at the time of application submission
        snapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Ensure one-to-one relationship between Employee and OnboardingApplication
OnboardingApplicationSchema.index({ employeeId: 1 }, { unique: true });

export default mongoose.model('OnboardingApplication', OnboardingApplicationSchema);