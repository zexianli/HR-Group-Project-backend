import EmployeeProfile from '../models/EmployeeProfile.js';
import House from '../models/House.js';

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
    }).select('firstName lastName cellPhone');

    const roommatesData = roommates.map((roommate) => ({
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
