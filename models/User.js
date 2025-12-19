import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // UUID
        username: {type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true }, // Hashed password
        role: { type: String, enum: ['HR', 'EMPLOYEE'], default: 'EMPLOYEE', required: true },
        employeeProfile: { type: String, ref: 'Employee', default: null }, // Reference to Employee model
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

export default mongoose.model("User", UserSchema);