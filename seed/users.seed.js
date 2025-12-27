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
      // ============================================
      // Visa management employees
      // OPT Employee 1: All documents approved
      {
        username: 'opt_complete',
        email: 'opt.complete@domain.com',
        passwordHash: await bcrypt.hash('@OptComplete123', 10),
        role: 'EMPLOYEE',
        onboardingStatus: 'APPROVED',
      },
      // OPT Employee 2: Mid-flow (RECEIPT approved, rest pending)
      {
        username: 'opt_midflow',
        email: 'opt.midflow@domain.com',
        passwordHash: await bcrypt.hash('@OptMidflow123', 10),
        role: 'EMPLOYEE',
        onboardingStatus: 'APPROVED',
      },
      // OPT Employee 3: Has rejected document
      {
        username: 'opt_rejected',
        email: 'opt.rejected@domain.com',
        passwordHash: await bcrypt.hash('@OptRejected123', 10),
        role: 'EMPLOYEE',
        onboardingStatus: 'APPROVED',
      },
      // OPT Employee 4: Just started (only RECEIPT pending)
      {
        username: 'opt_starter',
        email: 'opt.starter@domain.com',
        passwordHash: await bcrypt.hash('@OptStarter123', 10),
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
