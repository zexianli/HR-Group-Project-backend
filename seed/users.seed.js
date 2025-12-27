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
      // ============================================
      // Onboarding test employees
      // Employee 1: Pending onboarding
      {
        username: 'onboard_pending',
        email: 'onboard.pending@domain.com',
        passwordHash: await bcrypt.hash('@OnboardPending123', 10),
        role: 'EMPLOYEE',
        onboardingStatus: 'PENDING',
      },
      // Employee 2: Rejected onboarding
      {
        username: 'onboard_rejected',
        email: 'onboard.rejected@domain.com',
        passwordHash: await bcrypt.hash('@OnboardRejected123', 10),
        role: 'EMPLOYEE',
        onboardingStatus: 'REJECTED',
      },
      // Employee 3: Not started onboarding
      {
        username: 'onboard_notstarted',
        email: 'onboard.notstarted@domain.com',
        passwordHash: await bcrypt.hash('@OnboardNotstarted123', 10),
        role: 'EMPLOYEE',
        onboardingStatus: 'NOT_STARTED',
      },
    ]);

    // process.exit(0);
  } catch (err) {
    console.error(err);
    throw err;
    // process.exit(1);
  }
};
