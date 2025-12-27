import express from 'express';
import { authenticate, hrOnly } from '../middlewares/auth.js';
import * as hrVisaCtrl from '../controllers/hrVisaController.js';

const router = express.Router();

router.use(authenticate, hrOnly);

router.get('/pending', hrVisaCtrl.getPendingOptEmployees);

export default router;
