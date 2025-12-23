import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Embedded schemas
 */

const AddressSchema = new Schema(
  {
    unit: { type: String, trim: true, default: "" },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const LandlordSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false }
);

const FacilitySchema = new Schema(
  {
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    mattresses: { type: Number, default: 0, min: 0 },
    tables: { type: Number, default: 0, min: 0 },
    chairs: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/**
 * Main House schema
 */

const HouseSchema = new Schema(
  {
    address: {
      type: AddressSchema,
      required: true,
    },

    landlord: {
      type: LandlordSchema,
      required: true,
    },

    facility: {
      type: FacilitySchema,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("House", HouseSchema);
