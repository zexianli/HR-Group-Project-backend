import express from 'express';
import { register, validateToken, login } from '../controllers/authController.js';

const router = express.Router();

router.get('/validate-token', validateToken);
router.post('/register', register);
router.post('/login', login);

export default router;
