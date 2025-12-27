import crypto from 'crypto';
import RegistrationToken from '../models/RegistrationToken.js';
import { sendRegistrationEmail } from '../utils/emailService.js';

export const generateToken = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const createdBy = req.user.id;

    const registrationToken = new RegistrationToken({
      token,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      expiresAt,
      createdBy,
    });

    await registrationToken.save();

    try {
      await sendRegistrationEmail({
        to: email,
        name,
        token,
      });
    } catch (sendError) {
      await RegistrationToken.findByIdAndDelete(registrationToken._id);
      console.error('Failed to send email:', sendError);
      return res.status(500).json({
        message: 'Failed to send registration email',
        error: sendError.message,
      });
    }

    return res.status(201).json({
      message: 'Registration token generated and email sent successfully',
      data: {
        id: registrationToken._id,
        email: registrationToken.email,
        name: registrationToken.name,
        expiresAt: registrationToken.expiresAt,
        createdAt: registrationToken.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating token:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'A registration token already exists for this email',
      });
    }

    return res.status(500).json({
      message: 'An error occurred while generating the token',
      error: error.message,
    });
  }
};

export const getTokenHistory = async (req, res) => {
  try {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const REGISTRATION_PATH = '/register';

    const tokens = await RegistrationToken.find({})
      .sort({ createdAt: -1 })
      .select('email name token isUsed createdAt');

    const data = tokens.map((t) => ({
      email: t.email,
      name: t.name,
      link: `${FRONTEND_URL}${REGISTRATION_PATH}?token=${t.token}`,
      isUsed: t.isUsed,
      createdAt: t.createdAt,
    }));

    return res.status(200).json({
      message: 'Registration token history retrieved successfully',
      data,
    });
  } catch (err) {
    console.error('Error getting token history:', err);
    return res.status(500).json({
      message: 'An error occurred while fetching token history',
      error: err.message,
    });
  }
};
