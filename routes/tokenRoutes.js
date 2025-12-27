import express from 'express';
import { generateToken, getTokenHistory } from '../controllers/tokenController.js';
import { authenticate, hrOnly } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate', authenticate, hrOnly, generateToken);

router.get('/history', authenticate, hrOnly, getTokenHistory);

export default router;
