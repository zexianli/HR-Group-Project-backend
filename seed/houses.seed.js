// houses.seed.js
import House from '../models/House.js';
import EmployeeProfile from '../models/EmployeeProfile.js';

export const seedHouses = async (employees) => {
  try {
    await House.deleteMany({});

    const houses = await House.insertMany([
      {
        address: {
          unit: 'Apt 101',
          street: '76543 21st Ave N',
          city: 'Seattle',
          state: 'Washington',
          zip: '98034',
        },
        landlord: {
          fullName: 'John Smith',
          phone: '206-555-1234',
          email: 'john.smith@landlords.com',
        },
        facility: {
          bedrooms: 4,
          bathrooms: 2,
          mattresses: 4,
          tables: 2,
          chairs: 8,
        },
        status: 'ACTIVE',
        description: '4 Bedroom.',
      },
      {
        address: {
          unit: '',
          street: '45678 Broadway E',
          city: 'Bellevue',
          state: 'Washington',
          zip: '98004',
        },
        landlord: {
          fullName: 'Sarah Johnson',
          phone: '425-555-5678',
          email: 'sarah.j@realestate.com',
        },
        facility: {
          bedrooms: 3,
          bathrooms: 2,
          mattresses: 3,
          tables: 1,
          chairs: 6,
        },
        status: 'ACTIVE',
        description: '3 Bedroom house',
      },
    ]);

    // Assign 5 employees to house 1, 3 to house 2
    const house1Employees = employees.slice(0, 5);
    const house2Employees = employees.slice(5, 8);

    await EmployeeProfile.updateMany(
      { _id: { $in: house1Employees.map((e) => e._id) } },
      { $set: { houseId: houses[0]._id } }
    );

    await EmployeeProfile.updateMany(
      { _id: { $in: house2Employees.map((e) => e._id) } },
      { $set: { houseId: houses[1]._id } }
    );

    console.log(`House 1: ${house1Employees.length} residents`);
    console.log(`House 2: ${house2Employees.length} residents`);

    return houses;
  } catch (err) {
    console.error('Error seeding houses:', err);
    throw err;
  }
};
