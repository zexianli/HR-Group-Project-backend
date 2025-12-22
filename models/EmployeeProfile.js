import mongoose from "mongoose";

/**
 * Embedded schemas (stored inside EmployeeProfile document)
 * Note: { _id: false } avoids generating extra _id for subdocuments.
 */

const AddressSchema = new mongoose.Schema(
  {
    buildingApt: { type: String, default: "", trim: true }, // building/apt #
    street: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    zip: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const CarSchema = new mongoose.Schema(
  {
    make: { type: String, default: "", trim: true },
    model: { type: String, default: "", trim: true },
    color: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const DriverLicenseSchema = new mongoose.Schema(
  {
    number: { type: String, default: "", trim: true },
    expirationDate: { type: Date, default: null },
  },
  { _id: false },
);

const ReferenceSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    middleName: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    relationship: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const EmergencyContactSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    middleName: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    relationship: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const WORK_AUTH = [
  "CITIZEN",
  "GREEN_CARD",
  "H1B",
  "L2",
  "F1_CPT_OPT",
  "H4",
  "OTHER",
];

const GENDER = ["MALE", "FEMALE", "NO_ANSWER"];

/**
 * EmployeeProfile schema
 * - One-to-one with User via userId
 * - Stores long-term personal information and documents metadata (S3 keys/urls)
 * - Does NOT store workflow pointers (onboarding, visa current doc, house assignment pointer)
 */
const EmployeeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Name section
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    middleName: { type: String, default: "", trim: true },
    preferredName: { type: String, default: "", trim: true },

    // Identity section
    // NOTE: In requirements, email is on User and cannot be edited after token registration.
    // So email should NOT be duplicated here.
    ssn: { type: String, required: true, trim: true }, // consider encryption/masking at service layer
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: GENDER,
      required: true,
      default: "NO_ANSWER",
    },

    // Profile picture stored in S3 (store key rather than full URL if you plan to generate signed URLs)
    profilePictureKey: { type: String, default: "" },

    // Address & contact
    address: { type: AddressSchema, default: () => ({}) },
    cellPhone: { type: String, required: true, trim: true },
    workPhone: { type: String, default: "", trim: true },

    // Employment / authorization (current effective value)
    workAuthorizationType: { type: String, enum: WORK_AUTH, required: true },
    otherWorkAuthorizationTitle: { type: String, default: "", trim: true },
    workAuthorizationStart: { type: Date, default: null },
    workAuthorizationEnd: { type: Date, default: null },

    // Driver license (if applicable)
    driverLicense: { type: DriverLicenseSchema, default: () => ({}) },
    driverLicenseDocKey: { type: String, default: "" },

    // Optional car info
    carInformation: { type: CarSchema, default: () => ({}) },

    // Reference (exactly 1 max, but optional)
    reference: { type: ReferenceSchema, default: () => ({}) },

    // Emergency contacts (1+)
    emergencyContacts: {
      type: [EmergencyContactSchema],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "At least one emergency contact is required.",
      },
    },

    // House assignment (reference to House model)
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      default: null,
    },
  },
  { timestamps: true },
);

/**
 * Conditional validation: if workAuthorizationType is OTHER, require otherWorkAuthorizationTitle
 */
EmployeeProfileSchema.pre("validate", function (next) {
  if (
    this.workAuthorizationType === "OTHER" &&
    !this.otherWorkAuthorizationTitle
  ) {
    this.invalidate(
      "otherWorkAuthorizationTitle",
      "Please specify the work authorization title when type is OTHER.",
    );
  }
  next();
});

/**
 * Indexes for HR search & ordering:
 * HR needs search by first/last/preferred name and list ordered by last name.
 */
EmployeeProfileSchema.index({ lastName: 1, firstName: 1 });
EmployeeProfileSchema.index({ preferredName: 1 });

export default mongoose.model("EmployeeProfile", EmployeeProfileSchema);
