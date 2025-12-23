import bcrypt from 'bcrypt';
import { z } from 'zod';
import mongoose from 'mongoose';
import User from '../models/User.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import OnboardingApplication from '../models/OnboardingApplication.js';
import RegistrationToken from '../models/RegistrationToken.js';
import House from '../models/House.js';
import { generateJWTToken } from '../utils/jwtUtils.js';

const registerSchema = z.object({
  token: z.string().min(1, 'Token is required').trim(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(12, 'Username can be at most 12 characters long')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password can be at most 16 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(12, 'Username can be at most 12 characters long')
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

export const validateToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: 'Token is required',
      });
    }

    const tokenData = await RegistrationToken.findOne({
      token: token.trim(),
    });

    if (!tokenData) {
      return res.status(404).json({
        message: 'Invalid or non-existent registration token',
      });
    }

    if (tokenData.isUsed) {
      return res.status(409).json({
        message: 'Registration token has already been used',
      });
    }

    if (new Date() > tokenData.expiresAt) {
      return res.status(410).json({
        message: 'Registration token has expired',
      });
    }

    return res.status(200).json({
      message: 'Token is valid',
      data: {
        email: tokenData.email,
        name: tokenData.name,
      },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({
      message: 'An error occurred while validating the token',
      error: error.message,
    });
  }
};

export const register = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      await session.abortTransaction();
      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }

    const { token, username: cleanUsername, password } = validationResult.data;

    const tokenData = await RegistrationToken.findOneAndUpdate(
      {
        token: token.trim(),
        isUsed: false,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: { isUsed: true },
      },
      {
        session,
        new: false,
      }
    );

    if (!tokenData) {
      const existingToken = await RegistrationToken.findOne({
        token: token.trim(),
      }).session(session);

      await session.abortTransaction();

      if (!existingToken) {
        return res.status(404).json({
          message: 'Invalid or non-existent registration token',
        });
      }

      if (existingToken.isUsed) {
        return res.status(409).json({
          message: 'Registration token has already been used',
        });
      }

      if (new Date() > existingToken.expiresAt) {
        return res.status(410).json({
          message: 'Registration token has expired',
        });
      }

      return res.status(400).json({
        message: 'Unable to process registration token',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await User.create(
      [
        {
          username: cleanUsername,
          email: tokenData.email,
          passwordHash: hashedPassword,
          role: 'EMPLOYEE',
          onboardingStatus: 'NOT_STARTED',
          isActive: true,
        },
      ],
      { session }
    );

    const [employeeProfile] = await EmployeeProfile.create(
      [
        {
          userId: newUser._id,
          firstName: 'PENDING',
          lastName: 'PENDING',
          ssn: 'PENDING',
          dateOfBirth: new Date('1900-01-01'),
          gender: 'NO_ANSWER',
          cellPhone: 'PENDING',
          workAuthorizationType: 'OTHER',
          otherWorkAuthorizationTitle: 'PENDING',
          emergencyContacts: [
            {
              firstName: 'PENDING',
              lastName: 'PENDING',
              phone: 'PENDING',
              email: 'PENDING',
              relationship: 'PENDING',
            },
          ],
        },
      ],
      { session }
    );

    await OnboardingApplication.create(
      [
        {
          userId: newUser._id,
        },
      ],
      { session }
    );

    const count = await House.countDocuments().session(session);

    if (count > 0) {
      const random = Math.floor(Math.random() * count);
      const randomHouse = await House.findOne().skip(random).session(session);

      if (randomHouse) {
        await Promise.all([
          House.findByIdAndUpdate(
            randomHouse._id,
            { $push: { residentEmployeeIds: employeeProfile._id } },
            { session }
          ),
          EmployeeProfile.findByIdAndUpdate(
            employeeProfile._id,
            { houseId: randomHouse._id },
            { session }
          ),
        ]);
        console.log(`Assigned employee ${employeeProfile._id} to house ${randomHouse._id}`);
      }
    }

    await session.commitTransaction();

    const jwtToken = generateJWTToken(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
        token: jwtToken,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }

    if (error.code === 11000) {
      if (error.keyPattern?.username) {
        return res.status(409).json({
          message: 'Username already exists',
        });
      }
      if (error.keyPattern?.email) {
        return res.status(409).json({
          message: 'Email already registered',
        });
      }
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: error.message,
      });
    }

    return res.status(500).json({
      message: 'An error occurred during registration',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const login = async (req, res) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error?.errors?.map((err) => err.message) || [
        'Validation failed',
      ];
      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }

    const { username, password } = validationResult.data;

    const user = await User.findOne({ username }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is inactive.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    const jwtToken = generateJWTToken(user);

    return res.status(200).json({
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          onboardingStatus: user.onboardingStatus,
        },
        token: jwtToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }

    return res.status(500).json({
      message: 'An error occurred during login',
      error: error.message,
    });
  }
};
