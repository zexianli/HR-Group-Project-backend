import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', (req, res) => {
	res.status(200).json({ message: 'Hello world' });
});

export default app;
