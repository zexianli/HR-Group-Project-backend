import ReportThread from '../models/ReportThread.js';
import Comment from '../models/comment.js';

export const seedReports = async (users, house) => {
  try {
    await ReportThread.deleteMany({});
    await Comment.deleteMany({});

    const hrUser = users.find((u) => u.role === 'HR');
    const employeeUser = users.find((u) => u.role === 'EMPLOYEE');

    if (!hrUser || !employeeUser || !house) {
      throw new Error('Missing required data: HR user, Employee user, or House');
    }

    const reports = await ReportThread.insertMany([
      {
        houseId: house._id,
        createdBy: employeeUser._id,
        title: 'Broken Kitchen Sink Faucet',
        description: 'The kitchen sink faucet is leaking and needs immediate repair.',
        status: 'OPEN',
        createdAt: new Date('2024-12-20T10:00:00Z'),
      },
      {
        houseId: house._id,
        createdBy: employeeUser._id,
        title: 'Heating System Not Working',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        status: 'OPEN',
        createdAt: new Date('2024-12-21T14:30:00Z'),
      },
      {
        houseId: house._id,
        createdBy: employeeUser._id,
        title: 'Bathroom Door Lock Broken',
        description:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        status: 'IN_PROGRESS',
        createdAt: new Date('2024-12-22T09:15:00Z'),
      },
      {
        houseId: house._id,
        createdBy: employeeUser._id,
        title: 'Window Crack in Living Room',
        description:
          'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        status: 'OPEN',
        createdAt: new Date('2024-12-23T16:45:00Z'),
      },
      {
        houseId: house._id,
        createdBy: employeeUser._id,
        title: 'Leaking Roof in Bedroom',
        description:
          'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        status: 'CLOSED',
        createdAt: new Date('2024-12-24T11:20:00Z'),
      },
      {
        houseId: house._id,
        createdBy: employeeUser._id,
        title: 'Garage Door Malfunction',
        description:
          'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.',
        status: 'OPEN',
        createdAt: new Date('2024-12-25T13:00:00Z'),
      },
    ]);

    await Comment.insertMany([
      {
        reportId: reports[0]._id,
        message: 'I noticed this issue yesterday evening.',
        createdBy: employeeUser._id,
      },
      {
        reportId: reports[0]._id,
        message: 'Thank you for reporting this.',
        createdBy: hrUser._id,
      },
      {
        reportId: reports[0]._id,
        message: 'Thanks for the quick response.',
        createdBy: employeeUser._id,
      },
    ]);

    console.log('Reports seeded successfully');
    return reports;
  } catch (err) {
    console.error('Error seeding reports:', err);
    throw err;
  }
};
