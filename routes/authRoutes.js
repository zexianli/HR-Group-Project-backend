import express from 'express';
import { register, validateToken, login, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/validate-token', validateToken);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);

export default router;
