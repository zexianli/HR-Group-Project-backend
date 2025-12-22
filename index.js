import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

console.log("PWD =", process.cwd());
console.log("ENV =", {
  MONGODB_URI: process.env.MONGODB_URI,
  MONGO_URI: process.env.MONGO_URI,
});

const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  await connectDB(MONGODB_URI);

  app.listen(3000, () => console.log(`http://localhost:3000`));
}

startServer();
