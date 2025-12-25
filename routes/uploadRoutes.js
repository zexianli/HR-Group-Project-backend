import { Router } from 'express';
import multer from 'multer';
import { uploadFile, getPresignedPreviewUrl } from '../controllers/uploadController.js';
import { authenticate, employeeOnly } from '../middlewares/auth.js';

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
router.get('/preview-url', authenticate, getPresignedPreviewUrl);

export default router;
