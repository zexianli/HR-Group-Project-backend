import express from 'express';
import morgan from 'morgan';
import tokenRoutes from './routes/tokenRoutes.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/tokens', tokenRoutes);

app.use('/api', (req, res) => {
	res.status(200).json({ message: 'Hello world' });
});

export default app;
