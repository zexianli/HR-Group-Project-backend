// import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import User from '../models/User.js';
// import db connection
// import the models

export const seedUsers = async () => {
  try {
    await User.deleteMany({});

    return await User.insertMany([
      {
        username: 'testhr',
        email: 'testhr@domain.com',
        passwordHash: await bcrypt.hash('@TesthrPW123', 10),
        role: 'HR',
      },
      {
        username: 'testemployee',
        email: 'testemployee@domain.com',
        passwordHash: await bcrypt.hash('@TestemployeePW123', 10),
        role: 'EMPLOYEE',
        onboardingStatus: 'APPROVED',
      },
    ]);

    // process.exit(0);
  } catch (err) {
    console.error(err);
    throw err;
    // process.exit(1);
  }
};
