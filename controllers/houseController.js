import { z } from 'zod';
import EmployeeProfile from '../models/EmployeeProfile.js';
import House from '../models/House.js';
import ReportThread from '../models/ReportThread.js';
import Comment from '../models/comment.js';

const createReportSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  description: z.string().min(1, 'Description is required').trim(),
});

const createCommentSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be at most 2000 characters')
    .trim(),
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

export const addCommentToReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const reportId = req.params.id;

    const validationResult = createCommentSchema.safeParse(req.body);

    if (!validationResult.success) {
      const issues = validationResult.error?.issues ?? validationResult.error?.errors ?? [];
      const errors = issues.map((i) => i.message);

      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }

    const { description } = validationResult.data;

    const report = await ReportThread.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: 'Facility report not found',
      });
    }

    const isReportCreator = report.createdBy.toString() === userId;
    const isHR = userRole === 'HR';

    if (!isReportCreator && !isHR) {
      return res.status(403).json({
        message: 'Access denied. Only the report creator or HR can comment on this report',
      });
    }

    const comment = new Comment({
      reportId: reportId,
      message: description,
      createdBy: userId,
    });

    await comment.save();

    return res.status(201).json({
      message: 'Comment added successfully',
      data: {
        id: comment._id,
        reportId: comment.reportId,
        message: comment.message,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error('Error adding comment to report:', error);
    return res.status(500).json({
      message: 'An error occurred while adding the comment',
      error: error.message,
    });
  }
};

export const updateReportComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const reportId = req.params.id;
    const commentId = req.params.commentId;

    const validationResult = createCommentSchema.safeParse(req.body);
    if (!validationResult.success) {
      const issues = validationResult.error?.issues ?? validationResult.error?.errors ?? [];
      const errors = issues.map((i) => i.message);

      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }
    const { description } = validationResult.data;
    const report = await ReportThread.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: 'Facility report not found',
      });
    }

    const isReportCreator = report.createdBy.toString() === userId;
    const isHR = userRole === 'HR';

    if (!isReportCreator && !isHR) {
      return res.status(403).json({
        message: 'Access denied. Only the report creator or HR can update this comment',
      });
    }

    const comment = await Comment.findOne({ _id: commentId, reportId: reportId });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const isCommentCreator = comment?.createdBy.toString() === userId;
    if (!isCommentCreator && !isHR) {
      return res.status(403).json({
        message: 'Access denied. Only the comment creator or HR can update this comment',
      });
    }

    comment.message = description;
    await comment.save();

    return res.status(200).json({
      message: 'Comment updated successfully',
      data: {
        id: comment._id,
        reportId: comment.reportId,
        message: comment.message,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (err) {
    console.error('Error updating report comment:', err);
    return res.status(500).json({
      message: 'An error occurred while updating the comment',
      error: err.message,
    });
  }
};

export const getUserHouseReports = async (req, res) => {
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

    const reports = await ReportThread.find({ houseId: employeeProfile.houseId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Reports retrieved successfully',
      data: reports.map((report) => ({
        id: report._id,
        houseId: report.houseId,
        title: report.title,
        description: report.description,
        status: report.status,
        createdBy: {
          id: report.createdBy._id,
          username: report.createdBy.username,
        },
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching house reports:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching reports',
      error: error.message,
    });
  }
};

export const getReportComments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const reportId = req.params.id;

    const report = await ReportThread.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: 'Facility report not found',
      });
    }

    const isReportCreator = report.createdBy.toString() === userId;
    const isHR = userRole === 'HR';

    if (!isReportCreator && !isHR) {
      return res.status(403).json({
        message: 'Access denied. Only the report creator or HR can view comments',
      });
    }

    const comments = await Comment.find({ reportId })
      .populate('createdBy', 'username')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: 'Comments retrieved successfully',
      data: comments.map((comment) => ({
        id: comment._id,
        reportId: comment.reportId,
        message: comment.message,
        createdBy: {
          id: comment.createdBy._id,
          username: comment.createdBy.username,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching report comments:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching comments',
      error: error.message,
    });
  }
};
