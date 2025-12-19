import mongoose from "mongoose";

const RegistrationTokenSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        token: { type: String, required: true, unique: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        name: { type: String, required: true, trim: true },

        isUsed: { type: Boolean, default: false },
        expiresAt: { type: Date, required: true },
        createdBy: { type: String, ref: 'User', required: true }, // HR user
        createdAt: { type: Date, default: () => new Date() },
    },
    { timestamps: false} // No automatic createdAt/updatedAt fields
);

// set TTL index on expiresAt field 
// Add { expireAfterSeconds: 0 } to make documents expire exactly at expiresAt time
RegistrationTokenSchema.index({ expiresAt: 1});

export default mongoose.model('RegistrationToken', RegistrationTokenSchema);