const mongoose = require('mongoose');

// embedded schemas
const AddressSchema = new mongoose.Schema(
    {
        num: { type: String, default: '' },
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
    },
    { _id: false }
);

const CarSchema = new mongoose.Schema(
    {
        make: { type: String, default: '' },
        model: { type: String, default: '' },
        color: { type: String, default: '' },
    },
    { _id: false }
);

const DriverLicenseSchema = new mongoose.Schema(
    {
        number: { type: String, default: '' },
        expirationDate: { type: Date, default: null },
    },
    { _id: false }
);

const ReferenceSchema = new mongoose.Schema(
    {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        relationship: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },

    },
    { _id: false }
);

const EmergencyContactSchema = new mongoose.Schema(
    {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        middleName: { type: String, default: '' },
        relationship: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },   
    },
    { _id: false }
);

// main Employee schema
const EmployeeSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // UUID
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        middleName: { type: String, default: '', trim: true },
        preferredName: { type: String, default: '', trim: true },

        profilePictureUrl: { type: String, default: '' }, // S3 URL
        dateOfBirth: { type: Date, required: true },

        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true,
        },

        workAuthorization: {
            type: String,
            required: true,
            enum: [
                "Citizen",
                "Green Card",
                "H1-B",
                "L2",
                "F1(CPT/OPT)",
                "H4",
                "Other",
            ],
        },

        otherAuth: { type: String, default: '' }, // required if workAuthorization is "Other"
        workAuthorizationStart: { type: Date, default: null },
        workAuthorizationEnd: { type: Date, default: null },

        carInformation: { type: CarSchema, default: () => ({}) },
        driverLicense: { type: DriverLicenseSchema, default: () => ({}) },
        driverLicenseDoc: { type: String, default: '' }, // S3 URL

        cellPhone: { type: String, required: true, trim: true },
        workPhone: { type: String, default: '', trim: true },

        address: { type: AddressSchema, required: true },
        references: { type: [ReferenceSchema], default: [] },

        ssn: { type: String, required: true, trim: true },

        emergencyContacts: { 
            type: [EmergencyContactSchema], 
            required: true, 
            validate: v => Array.isArray(v) && v.length > 0 
        },

        houseId: { type: String, ref: 'House', default: null }, // Reference to House model

        currDocumentId: { type: String, ref: 'OPTDocument', default: null }, // Reference to Document model

        onboarding: { type: String, ref: 'OnboardingApplication', default: null }, // Reference to Onboarding model
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Conditional validation for otherAuth field
EmployeeSchema.pre("validate", function (next) {
    if (this.workAuthorization === "Other" && !this.otherAuth) {
        this.invalidate("otherAuth", "Please specify other work authorization");
    }
});

module.exports = mongoose.model('Employee', EmployeeSchema);





