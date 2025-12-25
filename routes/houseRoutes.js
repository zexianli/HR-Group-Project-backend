import express from 'express';
import { authenticate, employeeOnly } from '../middlewares/auth.js';
import {
  getAssignedHouse,
  createFacilityReport,
  addCommentToReport,
  updateReportComment,
} from '../controllers/houseController.js';

const router = express.Router();

router.get('/housing/me', authenticate, employeeOnly, getAssignedHouse);
router.post('/housing/reports', authenticate, employeeOnly, createFacilityReport);
router.post('/housing/reports/:id/comments', authenticate, addCommentToReport);
router.put('/housing/reports/:id/comments/:commentId', authenticate, updateReportComment);

export default router;
