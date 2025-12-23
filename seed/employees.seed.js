// import mongoose from "mongoose";
import EmployeeProfile from '../models/EmployeeProfile.js';
// import db connection
// import the models

export const seedEmployees = async (users) => {
  try {
    await EmployeeProfile.deleteMany({});

    const employeeUser = users.find((u) => u.username === 'testemployee');

    if (!employeeUser) {
      throw new Error('Employee user not found');
    }

    const employees = await EmployeeProfile.insertMany([
      {
        userId: employeeUser._id,
        firstName: 'Alice',
        lastName: 'Wu',
        middleName: 'Constance',
        preferredName: 'Alice',
        profilePictureKey: 'profile-pictures/alice-wu.jpg',
        dateOfBirth: new Date('2000-06-29'),
        gender: 'FEMALE',
        workAuthorizationType: 'F1_CPT_OPT',
        workAuthorizationStart: new Date('2024-03-08'),
        workAuthorizationEnd: new Date('2029-03-08'),
        carInformation: {
          make: 'Toyota',
          model: 'Civic',
          color: 'Silver',
        },
        driverLicense: {
          number: '1234567890',
          expirationDate: new Date('2028-03-03'),
        },
        driverLicenseDocKey: 'driver-licenses/alice-wu-dl.jpg',
        cellPhone: '1234567890',
        workPhone: '0987654321',
        address: {
          buildingApt: '',
          street: '12345 67th Ave W',
          city: 'Seattle',
          state: 'Washington',
          zip: '98012',
        },
        reference: {
          firstName: 'Manny',
          lastName: 'Pacquiao',
          middleName: '',
          phone: '1029384756',
          email: 'firstref@domain.com',
          relationship: 'Former Colleague',
        },
        ssn: '123456789',
        emergencyContacts: [
          {
            firstName: 'first',
            lastName: 'emergency',
            middleName: 'middle',
            phone: '21548751849',
            email: 'firstemerg@domain.com',
            relationship: 'siblings',
          },
          {
            firstName: 'second',
            lastName: 'emergency',
            middleName: 'middle',
            phone: '1452469109',
            email: 'secondemerg@domain.com',
            relationship: 'parent',
          },
        ],
      },
    ]);

    console.log('Employees seeded:', employees.length);
    return employees;

    // process.exit(0);
  } catch (err) {
    console.error('Error seeding employees:', err);
    throw err;
    // process.exit(1);
  }
};
