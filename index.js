import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  await connectDB(MONGODB_URI);

  app.listen(3000, () => console.log(`http://localhost:3000`));
}

startServer();
