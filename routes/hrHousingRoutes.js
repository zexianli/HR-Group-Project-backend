import express from 'express';
import { authenticate, hrOnly } from '../middlewares/auth.js';
import * as hrHousingCtrl from '../controllers/hrHousingController.js';

const router = express.Router();

router.use(authenticate, hrOnly);

router.get('/', hrHousingCtrl.getAllHouses);
router.get('/:id/reports', hrHousingCtrl.getHouseReports);
router.get('/:id', hrHousingCtrl.getHouseById);
router.post('/', hrHousingCtrl.createHouse);

export default router;
