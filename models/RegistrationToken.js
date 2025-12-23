import mongoose, { Schema } from "mongoose";

const RegistrationTokenSchema = new mongoose.Schema(
    {
        token: { 
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        email: { 
            type: String,
            required: true,
            lowercase: true,
            index: true,
            trim: true,
        },
        name: { 
            type: String,
            required: true,
            trim: true,
        },
        isUsed: { 
            type: Boolean,
            default: false,
            index: true,
        },
        expiresAt: { 
            type: Date,
            required: true,
            index: true,
        },
        createdBy: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', // HR user
            required: true },
    },
    { 
        timestamps: {
            createdAt: true,
            updatedAt: false,
        }
    }
);

// set TTL index on expiresAt field
// Add { expireAfterSeconds: 0 } to make documents expire exactly at expiresAt time
// MongoDB will automatically delete documents once expiresAt < now
RegistrationTokenSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

export default mongoose.model('RegistrationToken', RegistrationTokenSchema);
