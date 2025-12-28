import express from 'express';
import { authenticate, hrOnly } from '../middlewares/auth.js';
import * as hrEmployeesCtrl from '../controllers/hrEmployeesController.js';

const router = express.Router();

router.use(authenticate, hrOnly);

// Summary list (sorted + count)
router.get('/', hrEmployeesCtrl.getAllEmployeesSummary);

// Full profile
router.get('/:id', hrEmployeesCtrl.getEmployeeProfileById);

export default router;
