import mongoose from 'mongoose';

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

const LandlordSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  { _id: false }
);

const UtilitiesSchema = new mongoose.Schema(
  {
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    mattresses: { type: Number, default: 0 },
    tables: { type: Number, default: 0 },
    chairs: { type: Number, default: 0 },
  },
  { _id: false }
);

const HouseSchema = new mongoose.Schema(
  {
    address: { type: AddressSchema, default: () => ({}) },
    landlord: { type: LandlordSchema, default: () => ({}) },
    utilities: { type: UtilitiesSchema, default: () => ({}) },

    residentEmployeeIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'EmployeeProfile',
      default: [],
    },

    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('House', HouseSchema);
