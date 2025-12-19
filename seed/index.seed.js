import dotenv from "dotenv";
import { seedUsers } from "./users.seed.js";
import { seedEmployees } from "./employees.seed.js";
import { seedHouses } from "./houses.seed.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const runSeeds = async () => {
  try {
    await connectDB(MONGODB_URI); // connect once at the top

    await seedUsers();
    await seedEmployees();
    await seedHouses();

    console.log("All seeds completed");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
};

await runSeeds();
