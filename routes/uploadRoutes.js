import { Router } from 'express';
import multer from 'multer';
import {
  uploadFile,
  getPresignedPreviewUrl,
  getPresignedPreviewUrlForHR,
} from '../controllers/uploadController.js';
import { authenticate, employeeOnly, hrOnly } from '../middlewares/auth.js';
import { requireOptVisaCase } from '../middlewares/requireOptVisaCase.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = new Set(['application/pdf', 'image/jpeg', 'image/png']);
    if (!allowed.has(file.mimetype)) {
      return cb(new Error('Only pdf, jpg, png allowed'), false); // reject the file with callback
    }
    cb(null, true); // accept the file
  },
});

router.post('/upload', authenticate, employeeOnly, upload.single('file'), uploadFile);

// Visa document upload route with opt visa case requirement
router.post(
  '/visa/upload',
  authenticate,
  employeeOnly,
  requireOptVisaCase,
  upload.single('file'),
  uploadFile
);

// For general purpose and Visa management preview URL retrieval
router.get('/preview-url', authenticate, getPresignedPreviewUrl);

// For HR
router.get('/hr/preview-url', authenticate, hrOnly, getPresignedPreviewUrlForHR);

export default router;
