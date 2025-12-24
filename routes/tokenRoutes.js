import express from 'express';
import { generateToken } from '../controllers/tokenController.js';
import { authenticate, hrOnly } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate', authenticate, hrOnly, generateToken);

export default router;
