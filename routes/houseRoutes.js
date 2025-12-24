import express from 'express';
import { authenticate, employeeOnly } from '../middlewares/auth.js';
import { getAssignedHouse } from '../controllers/houseController.js';

const router = express.Router();

router.get('/housing/me', authenticate, employeeOnly, getAssignedHouse);

export default router;
