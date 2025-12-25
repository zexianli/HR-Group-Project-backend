import express from 'express';
import { authenticate, employeeOnly } from '../middlewares/auth.js';
import { getAssignedHouse, createFacilityReport } from '../controllers/houseController.js';

const router = express.Router();

router.get('/housing/me', authenticate, employeeOnly, getAssignedHouse);
router.post('/housing/reports', authenticate, employeeOnly, createFacilityReport);

export default router;
