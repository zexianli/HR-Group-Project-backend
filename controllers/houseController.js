import { z } from 'zod';
import EmployeeProfile from '../models/EmployeeProfile.js';
import House from '../models/House.js';
import ReportThread from '../models/ReportThread.js';

const createReportSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  description: z.string().min(1, 'Description is required').trim(),
});

export const getAssignedHouse = async (req, res) => {
  try {
    const userId = req.user.id;

    const employeeProfile = await EmployeeProfile.findOne({ userId });

    if (!employeeProfile) {
      return res.status(404).json({
        message: 'Employee profile not found',
      });
    }

    if (!employeeProfile.houseId) {
      return res.status(404).json({
        message: 'No house assigned to this employee',
      });
    }

    const house = await House.findById(employeeProfile.houseId);

    if (!house) {
      return res.status(404).json({
        message: 'Assigned house not found',
      });
    }

    const roommates = await EmployeeProfile.find({
      houseId: employeeProfile.houseId,
    })
      .populate('userId', 'onboardingStatus')
      .select('firstName lastName cellPhone userId');

    const roommatesData = roommates
      .filter((roommate) => roommate.userId?.onboardingStatus === 'APPROVED')
      .map((roommate) => ({
        firstName: roommate.firstName,
        lastName: roommate.lastName,
        phone: roommate.cellPhone,
      }));

    return res.status(200).json({
      message: 'House retrieved successfully',
      data: {
        house: {
          id: house._id,
          address: house.address,
          landlord: house.landlord,
          facility: house.facility,
          status: house.status,
          description: house.description,
          createdAt: house.createdAt,
          updatedAt: house.updatedAt,
        },
        roommates: roommatesData,
      },
    });
  } catch (error) {
    console.error('Error fetching assigned house:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching the assigned house',
      error: error.message,
    });
  }
};

export const createFacilityReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const validationResult = createReportSchema.safeParse(req.body);

    if (!validationResult.success) {
      const issues = validationResult.error?.issues ?? validationResult.error?.errors ?? [];
      const errors = issues.map((i) => i.message);

      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }

    const { title, description } = validationResult.data;

    const employeeProfile = await EmployeeProfile.findOne({ userId });

    if (!employeeProfile) {
      return res.status(404).json({
        message: 'Employee profile not found',
      });
    }

    if (!employeeProfile.houseId) {
      return res.status(400).json({
        message: 'Employee not assigned to a house',
      });
    }

    const house = await House.findById(employeeProfile.houseId);
    if (!house) return res.status(404).json({ message: 'Assigned house not found' });


    const report = new ReportThread({
      houseId: employeeProfile.houseId,
      createdBy: userId,
      title,
      description,
      status: 'OPEN',
    });

    await report.save();

    return res.status(201).json({
      message: 'Facility report created successfully',
      data: {
        id: report._id,
        houseId: report.houseId,
        createdBy: report.createdBy,
        title: report.title,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating facility report:', error);
    return res.status(500).json({
      message: 'An error occurred while creating the facility report',
      error: error.message,
    });
  }
};
