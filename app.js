import express from 'express';
import morgan from 'morgan';
import tokenRoutes from './routes/tokenRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import hrOnboardingRoutes from './routes/hrOnboardingRoutes.js';
import houseRoutes from './routes/houseRoutes.js';
import employeeVisaRoutes from './routes/employeeVisaRoutes.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api', uploadRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/hr', hrOnboardingRoutes);
app.use('/api/employee/visa', employeeVisaRoutes);
app.use('/api/housing', houseRoutes);

app.use('/api', (req, res) => {
  res.status(200).json({ message: 'Hello world' });
});

export default app;
