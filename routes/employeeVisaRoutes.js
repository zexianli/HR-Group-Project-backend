import express from 'express';
import { authenticate, employeeOnly } from '../middlewares/auth.js';
import { requireOptVisaCase } from '../middlewares/requireOptVisaCase.js';
import * as visaCtrl from '../controllers/employeeVisaController.js';

const router = express.Router();

// logged in + employee + opt visa case required for all routes below
router.use(authenticate, employeeOnly, requireOptVisaCase);

router.get('/status', visaCtrl.getVisaStatus);
//router.get('/i983/templates', visaCtrl.getI983Templates);

export default router;
