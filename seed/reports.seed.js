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

    const report = await ReportThread.create({
      houseId: house._id,
      createdBy: employeeUser._id,
      title: 'Broken Kitchen Sink Faucet',
      description: 'The kitchen sink faucet is leaking.',
      status: 'OPEN',
    });

    await Comment.insertMany([
      {
        reportId: report._id,
        message: 'I noticed this issue yesterday evening.',
        createdBy: employeeUser._id,
      },
      {
        reportId: report._id,
        message: 'Thank you for reporting this.',
        createdBy: hrUser._id,
      },
      {
        reportId: report._id,
        message: 'Thanks for the quick response.',
        createdBy: employeeUser._id,
      },
    ]);

    console.log('Reports seeded successfully');
    return report;
  } catch (err) {
    console.error('Error seeding reports:', err);
    throw err;
  }
};
