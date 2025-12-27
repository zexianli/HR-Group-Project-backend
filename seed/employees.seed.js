// import mongoose from "mongoose";
import EmployeeProfile from '../models/EmployeeProfile.js';
// import db connection
// import the models

export const seedEmployees = async (users) => {
  try {
    await EmployeeProfile.deleteMany({});

    const employeeUser = users.find((u) => u.username === 'testemployee');
    const optComplete = users.find((u) => u.username === 'opt_complete');
    const optMidflow = users.find((u) => u.username === 'opt_midflow');
    const optRejected = users.find((u) => u.username === 'opt_rejected');
    const optStarter = users.find((u) => u.username === 'opt_starter');
    const onboardPending = users.find((u) => u.username === 'onboard_pending');
    const onboardRejected = users.find((u) => u.username === 'onboard_rejected');
    const onboardNotstarted = users.find((u) => u.username === 'onboard_notstarted');

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
      // OPT Employee 1: Complete visa flow
      {
        userId: optComplete._id,
        firstName: 'John',
        lastName: 'Complete',
        ssn: '987654321',
        dateOfBirth: new Date('1998-05-15'),
        gender: 'MALE',
        cellPhone: '2223334444',
        workAuthorizationType: 'F1_CPT_OPT',
        workAuthorizationStart: new Date('2024-01-01'),
        workAuthorizationEnd: new Date('2026-01-01'),
        emergencyContacts: [
          {
            firstName: 'Jane',
            lastName: 'Complete',
            phone: '1112223333',
            email: 'jane.complete@domain.com',
            relationship: 'Spouse',
          },
        ],
      },
      // OPT Employee 2: Mid-flow
      {
        userId: optMidflow._id,
        firstName: 'Sarah',
        lastName: 'Midflow',
        ssn: '111222333',
        dateOfBirth: new Date('1999-08-20'),
        gender: 'FEMALE',
        cellPhone: '3334445555',
        workAuthorizationType: 'F1_CPT_OPT',
        workAuthorizationStart: new Date('2024-06-01'),
        workAuthorizationEnd: new Date('2026-06-01'),
        emergencyContacts: [
          {
            firstName: 'Tom',
            lastName: 'Midflow',
            phone: '4445556666',
            email: 'tom.midflow@domain.com',
            relationship: 'Father',
          },
        ],
      },
      // OPT Employee 3: Rejected document
      {
        userId: optRejected._id,
        firstName: 'Mike',
        lastName: 'Rejected',
        ssn: '444555666',
        dateOfBirth: new Date('1997-11-10'),
        gender: 'MALE',
        cellPhone: '5556667777',
        workAuthorizationType: 'F1_CPT_OPT',
        workAuthorizationStart: new Date('2024-03-15'),
        workAuthorizationEnd: new Date('2026-03-15'),
        emergencyContacts: [
          {
            firstName: 'Lisa',
            lastName: 'Rejected',
            phone: '6667778888',
            email: 'lisa.rejected@domain.com',
            relationship: 'Mother',
          },
        ],
      },
      // OPT Employee 4: Just started
      {
        userId: optStarter._id,
        firstName: 'Emma',
        lastName: 'Starter',
        ssn: '777888999',
        dateOfBirth: new Date('2000-02-28'),
        gender: 'FEMALE',
        cellPhone: '8889990000',
        workAuthorizationType: 'F1_CPT_OPT',
        workAuthorizationStart: new Date('2024-09-01'),
        workAuthorizationEnd: new Date('2026-09-01'),
        emergencyContacts: [
          {
            firstName: 'David',
            lastName: 'Starter',
            phone: '9990001111',
            email: 'david.starter@domain.com',
            relationship: 'Brother',
          },
        ],
      },
      // ============================================
      // Onboarding test employees (non-approved states)
      // Employee 1: PENDING onboarding - F1_CPT_OPT to test blocked visa access
      // ============================================
      {
        userId: onboardPending._id,
        firstName: 'Bob',
        lastName: 'Pending',
        ssn: '222333444',
        dateOfBirth: new Date('1999-03-12'),
        gender: 'MALE',
        cellPhone: '1231231234',
        workAuthorizationType: 'F1_CPT_OPT',
        workAuthorizationStart: new Date('2024-08-01'),
        workAuthorizationEnd: new Date('2026-08-01'),
        emergencyContacts: [
          {
            firstName: 'Mary',
            lastName: 'Pending',
            phone: '4564564567',
            email: 'mary.pending@domain.com',
            relationship: 'Mother',
          },
        ],
      },
      // Employee 2: REJECTED onboarding - H1B visa type
      {
        userId: onboardRejected._id,
        firstName: 'Carol',
        lastName: 'Rejected',
        ssn: '555666777',
        dateOfBirth: new Date('1996-07-25'),
        gender: 'FEMALE',
        cellPhone: '7897897890',
        workAuthorizationType: 'H1B',
        workAuthorizationStart: new Date('2024-01-01'),
        workAuthorizationEnd: new Date('2027-01-01'),
        emergencyContacts: [
          {
            firstName: 'Steve',
            lastName: 'Rejected',
            phone: '1011011010',
            email: 'steve.rejected@domain.com',
            relationship: 'Spouse',
          },
        ],
      },
      // Employee 3: NOT_STARTED onboarding - Green Card
      {
        userId: onboardNotstarted._id,
        firstName: 'Dan',
        lastName: 'Notstarted',
        ssn: '888999000',
        dateOfBirth: new Date('1995-11-30'),
        gender: 'MALE',
        cellPhone: '3213213210',
        workAuthorizationType: 'GREEN_CARD',
        emergencyContacts: [
          {
            firstName: 'Linda',
            lastName: 'Notstarted',
            phone: '6546546540',
            email: 'linda.notstarted@domain.com',
            relationship: 'Sister',
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
