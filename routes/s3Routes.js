import { Router } from 'express';
import multer from 'multer';
import { testUploadToS3 } from '../controllers/s3TestController.js';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for testing purposes
});

router.post('/upload', upload.single('file'), testUploadToS3);
export default router;