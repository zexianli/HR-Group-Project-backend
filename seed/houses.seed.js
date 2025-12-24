// houses.seed.js
import House from '../models/House.js';
import EmployeeProfile from '../models/EmployeeProfile.js';

export const seedHouses = async (employees) => {
  try {
    await House.deleteMany({});

    const house = await House.create({
      address: {
        unit: '', // optional in schema
        street: '76543 21th Ave N',
        city: 'Seattle',
        state: 'Washington',
        zip: '98034',
      },
      landlord: {
        fullName: 'Landlord Full Name',
        phone: '1234567898765',
        email: 'landlord@gmail.com',
      },
      facility: {
        bedrooms: 4,
        bathrooms: 2,
        mattresses: 4,
        tables: 4,
        chairs: 4,
      },
      status: 'ACTIVE',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...",
    });

    // House no longer stores resident ids; EmployeeProfile stores the houseId
    await EmployeeProfile.updateMany(
      { _id: { $in: employees.map((e) => e._id) } },
      { $set: { houseId: house._id } }
    );

    return house;
  } catch (err) {
    console.error('Error seeding houses:', err);
    throw err;
  }
};
