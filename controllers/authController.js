import bcrypt from "bcrypt";
import { z } from "zod";
import User from "../models/User.js";
import EmployeeProfile from "../models/EmployeeProfile.js";
import RegistrationToken from "../models/RegistrationToken.js";
import House from "../models/House.js";
import { generateJWTToken } from "../utils/jwtUtils.js";

const registerSchema = z.object({
  token: z.string().min(1, "Token is required").trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(12, "Username can be at most 12 characters long")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(16, "Password can be at most 16 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const validateToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Token is required",
      });
    }

    const tokenData = await RegistrationToken.findOne({
      token: token.trim(),
    });

    if (!tokenData) {
      return res.status(404).json({
        message: "Invalid or non-existent registration token",
      });
    }

    if (tokenData.isUsed) {
      return res.status(409).json({
        message: "Registration token has already been used",
      });
    }

    if (new Date() > tokenData.expiresAt) {
      return res.status(410).json({
        message: "Registration token has expired",
      });
    }

    return res.status(200).json({
      message: "Token is valid",
      data: {
        email: tokenData.email,
        name: tokenData.name,
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({
      message: "An error occurred while validating the token",
      error: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      return res.status(400).json({
        message: errors[0],
        errors: errors,
      });
    }

    const { token, username: cleanUsername, password } = validationResult.data;

    const tokenData = await RegistrationToken.findOne({
      token: token.trim(),
    });

    if (!tokenData) {
      return res.status(404).json({
        message: "Invalid or non-existent registration token",
      });
    }

    if (tokenData.isUsed) {
      return res.status(409).json({
        message: "Registration token has already been used",
      });
    }

    if (new Date() > tokenData.expiresAt) {
      return res.status(410).json({
        message: "Registration token has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: cleanUsername,
      email: tokenData.email,
      passwordHash: hashedPassword,
      role: "EMPLOYEE",
      onboardingStatus: "NOT_STARTED",
      isActive: true,
    });

    // Prefill with PENDING
    const employeeProfile = await EmployeeProfile.create({
      userId: newUser._id,
      firstName: "PENDING",
      lastName: "PENDING",
      ssn: "PENDING",
      dateOfBirth: new Date("1900-01-01"),
      gender: "NO_ANSWER",
      cellPhone: "PENDING",
      workAuthorizationType: "OTHER",
      otherWorkAuthorizationTitle: "PENDING",
      emergencyContacts: [
        {
          firstName: "PENDING",
          lastName: "PENDING",
          phone: "PENDING",
          email: "PENDING",
          relationship: "PENDING",
        },
      ],
    });

    tokenData.isUsed = true;
    await tokenData.save();

    try {
      const count = await House.countDocuments();

      if (count > 0) {
        const random = Math.floor(Math.random() * count);
        const randomHouse = await House.findOne().skip(random);

        if (randomHouse) {
          await Promise.all([
            House.findByIdAndUpdate(randomHouse._id, {
              $push: { residentEmployeeIds: employeeProfile._id },
            }),
            EmployeeProfile.findByIdAndUpdate(employeeProfile._id, {
              houseId: randomHouse._id,
            }),
          ]);
          console.log(
            `Assigned employee ${employeeProfile._id} to house ${randomHouse._id}`,
          );
        }
      }
    } catch (houseError) {
      console.error("House assignment error:", houseError);
    }

    const jwtToken = generateJWTToken(newUser);

    return res.status(201).json({
      message: "Registration successful",
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
    console.error("Registration error:", error);

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
          message: "Username already exists",
        });
      }
      if (error.keyPattern?.email) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};
