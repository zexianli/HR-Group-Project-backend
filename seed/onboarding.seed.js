import OnboardingApplication from '../models/OnboardingApplication.js';

export const seedOnboarding = async (users) => {
  try {
    await OnboardingApplication.deleteMany({});

    const hrUser = users.find((u) => u.role === 'HR');
    const testEmployee = users.find((u) => u.username === 'testemployee');
    const optComplete = users.find((u) => u.username === 'opt_complete');
    const optMidflow = users.find((u) => u.username === 'opt_midflow');
    const optRejected = users.find((u) => u.username === 'opt_rejected');
    const optStarter = users.find((u) => u.username === 'opt_starter');
    const onboardPending = users.find((u) => u.username === 'onboard_pending');
    const onboardRejected = users.find((u) => u.username === 'onboard_rejected');
    const onboardNotstarted = users.find((u) => u.username === 'onboard_notstarted');

    if (
      !hrUser ||
      !testEmployee ||
      !optComplete ||
      !optMidflow ||
      !optRejected ||
      !optStarter ||
      !onboardPending ||
      !onboardRejected ||
      !onboardNotstarted
    ) {
      throw new Error('One or more required users not found');
    }

    await OnboardingApplication.insertMany([
      // ============================================
      // APPROVED Onboarding Applications
      // ============================================
      {
        userId: testEmployee._id,
        status: 'APPROVED',
        feedback: '',
        submittedAt: new Date('2024-12-01T10:00:00Z'),
        reviewedAt: new Date('2024-12-02T14:30:00Z'),
        reviewedBy: hrUser._id,
        snapshot: {
          firstName: 'Alice',
          lastName: 'Wu',
          preferredName: 'Alice',
          email: 'testemployee@domain.com',
          ssn: '123456789',
          dateOfBirth: '2000-06-29',
          gender: 'FEMALE',
        },
      },
      {
        userId: optComplete._id,
        status: 'APPROVED',
        feedback: '',
        submittedAt: new Date('2024-11-15T09:00:00Z'),
        reviewedAt: new Date('2024-11-16T11:00:00Z'),
        reviewedBy: hrUser._id,
        snapshot: {
          firstName: 'John',
          lastName: 'Complete',
          email: 'opt.complete@domain.com',
          ssn: '987654321',
          dateOfBirth: '1998-05-15',
          gender: 'MALE',
        },
      },
      {
        userId: optMidflow._id,
        status: 'APPROVED',
        feedback: '',
        submittedAt: new Date('2024-11-20T10:30:00Z'),
        reviewedAt: new Date('2024-11-21T09:15:00Z'),
        reviewedBy: hrUser._id,
        snapshot: {
          firstName: 'Sarah',
          lastName: 'Midflow',
          email: 'opt.midflow@domain.com',
          ssn: '111222333',
          dateOfBirth: '1999-08-20',
          gender: 'FEMALE',
        },
      },
      {
        userId: optRejected._id,
        status: 'APPROVED',
        feedback: '',
        submittedAt: new Date('2024-11-25T14:00:00Z'),
        reviewedAt: new Date('2024-11-26T10:20:00Z'),
        reviewedBy: hrUser._id,
        snapshot: {
          firstName: 'Mike',
          lastName: 'Rejected',
          email: 'opt.rejected@domain.com',
          ssn: '444555666',
          dateOfBirth: '1997-11-10',
          gender: 'MALE',
        },
      },
      {
        userId: optStarter._id,
        status: 'APPROVED',
        feedback: '',
        submittedAt: new Date('2024-12-10T11:45:00Z'),
        reviewedAt: new Date('2024-12-11T13:00:00Z'),
        reviewedBy: hrUser._id,
        snapshot: {
          firstName: 'Emma',
          lastName: 'Starter',
          email: 'opt.starter@domain.com',
          ssn: '777888999',
          dateOfBirth: '2000-02-28',
          gender: 'FEMALE',
        },
      },

      // ============================================
      // PENDING Onboarding
      // ============================================
      {
        userId: onboardPending._id,
        status: 'PENDING',
        feedback: '',
        submittedAt: new Date('2024-12-23T15:30:00Z'),
        reviewedAt: null,
        reviewedBy: null,
        snapshot: {
          firstName: 'Bob',
          lastName: 'Pending',
          email: 'onboard.pending@domain.com',
          ssn: '222333444',
          dateOfBirth: '1999-03-12',
          gender: 'MALE',
        },
      },

      // ============================================
      // REJECTED Onboarding
      // ============================================
      {
        userId: onboardRejected._id,
        status: 'REJECTED',
        feedback:
          'The emergency contact information is incomplete. Please provide a valid phone number and email address. Also, the work authorization end date appears to be incorrect.',
        submittedAt: new Date('2024-12-18T13:00:00Z'),
        reviewedAt: new Date('2024-12-19T16:45:00Z'),
        reviewedBy: hrUser._id,
        snapshot: {
          firstName: 'Carol',
          lastName: 'Rejected',
          email: 'onboard.rejected@domain.com',
          ssn: '555666777',
          dateOfBirth: '1996-07-25',
          gender: 'FEMALE',
        },
      },

      // ============================================
      // NOT_STARTED Onboarding
      // ============================================
      {
        userId: onboardNotstarted._id,
        status: 'NOT_STARTED',
        feedback: '',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        snapshot: null,
      },
    ]);

    console.log('Onboarding applications seeded successfully');
  } catch (err) {
    console.error('Error seeding onboarding applications:', err);
    throw err;
  }
};
