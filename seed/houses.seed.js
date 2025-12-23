// import mongoose from "mongoose";
import House from '../models/House.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
// import db connection
// import the models

export const seedHouses = async (employees) => {
  try {
    await House.deleteMany({});

    const house = await House.create({
      address: {
        num: '',
        street: '76543 21th Ave N',
        city: 'Seattle',
        state: 'Washington',
        zip: '98034',
      },
      landlord: {
        fullName: 'Landlord Full Name',
        phoneNumber: '1234567898765',
        email: 'landlord@gmail.com',
      },
      utilities: {
        bedrooms: 4,
        bathrooms: 2,
        mattresses: 4,
        tables: 4,
        chairs: 4,
      },
      residentEmployeeIds: employees.map((e) => e._id),
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    });

    await EmployeeProfile.updateMany(
      { _id: { $in: employees.map((e) => e._id) } },
      { houseId: house._id }
    );

    return house;

    // process.exit(0);
  } catch (err) {
    console.error(err);
    throw err;
    // process.exit(1);
  }
};
