import { z } from 'zod';
import House from '../models/House.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import ReportThread from '../models/ReportThread.js';

const createHouseSchema = z.object({
  address: z.object({
    unit: z.string().trim().optional().default(''),
    street: z.string().min(1, 'Street is required').trim(),
    city: z.string().min(1, 'City is required').trim(),
    state: z.string().min(1, 'State is required').trim(),
    zip: z.string().min(1, 'ZIP code is required').trim(),
  }),
  landlord: z.object({
    fullName: z.string().min(1, 'Landlord full name is required').trim(),
    phone: z.string().min(1, 'Landlord phone is required').trim(),
    email: z.email('Valid email is required').toLowerCase().trim(),
  }),
  facility: z.object({
    bedrooms: z.number().min(0, 'Bedrooms must be 0 or greater'),
    bathrooms: z.number().min(0, 'Bathrooms must be 0 or greater'),
    mattresses: z.number().min(0, 'Mattresses must be 0 or greater').optional().default(0),
    tables: z.number().min(0, 'Tables must be 0 or greater').optional().default(0),
    chairs: z.number().min(0, 'Chairs must be 0 or greater').optional().default(0),
  }),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  description: z.string().trim().optional().default(''),
});

/**
 * GET /api/hr/housing
 * Returns all houses with summary information
 */
export async function getAllHouses(req, res) {
  try {
    const houses = await House.find().lean();

    // Get resident counts for each house
    const housesWithCounts = await Promise.all(
      houses.map(async (house) => {
        const residentCount = await EmployeeProfile.countDocuments({
          houseId: house._id,
        });

        return {
          id: house._id,
          address: {
            street: house.address.street,
            city: house.address.city,
            state: house.address.state,
            zip: house.address.zip,
          },
          landlord: {
            name: house.landlord.fullName,
            phone: house.landlord.phone,
            email: house.landlord.email,
          },
          residentCount,
        };
      })
    );

    return res.status(200).json({
      message: 'Houses retrieved successfully',
      data: housesWithCounts,
    });
  } catch (error) {
    console.error('Error fetching houses:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching houses',
      error: error.message,
    });
  }
}

/**
 * GET /api/hr/housing/:id
 * Returns full house details including residents
 */
export async function getHouseById(req, res) {
  try {
    const { id } = req.params;

    const house = await House.findById(id).lean();

    if (!house) {
      return res.status(404).json({
        message: 'House not found',
      });
    }

    // Get all residents for this house
    const residents = await EmployeeProfile.find({ houseId: id })
      .select('firstName lastName preferredName cellPhone carInformation userId')
      .populate('userId', 'email')
      .lean();

    const residentsData = residents.map((resident) => ({
      name: {
        firstName: resident.firstName,
        lastName: resident.lastName,
        preferredName: resident.preferredName,
      },
      phone: resident.cellPhone,
      email: resident.userId?.email || '',
      car: resident.carInformation
        ? {
            make: resident.carInformation.make,
            model: resident.carInformation.model,
            color: resident.carInformation.color,
          }
        : null,
    }));

    return res.status(200).json({
      message: 'House details retrieved successfully',
      data: {
        id: house._id,
        address: house.address,
        landlord: house.landlord,
        facility: house.facility,
        status: house.status,
        description: house.description,
        residents: residentsData,
        createdAt: house.createdAt,
        updatedAt: house.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching house details:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching house details',
      error: error.message,
    });
  }
}

/**
 * POST /api/hr/housing
 * Creates a new house
 */
export async function createHouse(req, res) {
  try {
    const validationResult = createHouseSchema.safeParse(req.body);

    if (!validationResult.success) {
      const issues = validationResult.error?.issues ?? validationResult.error?.errors ?? [];
      const errors = issues.map((i) => i.message);

      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }

    const houseData = validationResult.data;

    const newHouse = await House.create(houseData);

    return res.status(201).json({
      message: 'House created successfully',
      data: {
        id: newHouse._id,
        address: newHouse.address,
        landlord: newHouse.landlord,
        facility: newHouse.facility,
        status: newHouse.status,
        description: newHouse.description,
        createdAt: newHouse.createdAt,
        updatedAt: newHouse.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating house:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: error.message,
      });
    }

    return res.status(500).json({
      message: 'An error occurred while creating the house',
      error: error.message,
    });
  }
}

export async function getHouseReports(req, res) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const house = await House.findById(id);

    if (!house) {
      return res.status(404).json({
        message: 'House not found',
      });
    }

    const totalReports = await ReportThread.countDocuments({ houseId: id });

    const reports = await ReportThread.find({ houseId: id })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const reportsData = reports.map((report) => ({
      id: report._id,
      title: report.title,
      description: report.description,
      status: report.status,
      createdBy: {
        id: report.createdBy._id,
        username: report.createdBy.username,
        email: report.createdBy.email,
      },
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }));

    return res.status(200).json({
      message: 'House reports retrieved successfully',
      data: reportsData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit),
        totalReports,
        reportsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching house reports:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching house reports',
      error: error.message,
    });
  }
}
