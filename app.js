import express from 'express';
import morgan from 'morgan';
import tokenRoutes from './routes/tokenRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/tokens', tokenRoutes);
app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);

app.use('/api', (req, res) => {
  res.status(200).json({ message: 'Hello world' });
});

export default app;
