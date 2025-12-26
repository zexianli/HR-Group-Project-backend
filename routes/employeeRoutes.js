import express from 'express';
import { authenticate, employeeOnly } from '../middlewares/auth.js';
import {
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
} from '../controllers/employeeController.js';

const router = express.Router();

router.get('/me', authenticate, employeeOnly, getMyEmployeeProfile);
router.put('/me', authenticate, employeeOnly, updateMyEmployeeProfile);

export default router;
