import express from 'express';
import { authenticate, employeeOnly } from '../middlewares/auth.js';
import {
  getAssignedHouse,
  createFacilityReport,
  addCommentToReport,
  updateReportComment,
  getReportComments,
  getUserHouseReports,
  getReportById,
  updateReportStatus,
} from '../controllers/houseController.js';

const router = express.Router();

router.get('/me', authenticate, employeeOnly, getAssignedHouse);
router.get('/reports', authenticate, employeeOnly, getUserHouseReports);
router.post('/reports', authenticate, employeeOnly, createFacilityReport);
router.get('/reports/:id', authenticate, getReportById);
router.patch('/reports/:id', authenticate, updateReportStatus);
router.get('/reports/:id/comments', authenticate, getReportComments);
router.post('/reports/:id/comments', authenticate, addCommentToReport);
router.put('/reports/:id/comments/:commentId', authenticate, updateReportComment);

export default router;
