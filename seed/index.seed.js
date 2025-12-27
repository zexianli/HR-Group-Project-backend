import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedUsers } from './users.seed.js';
import { seedEmployees } from './employees.seed.js';
import { seedHouses } from './houses.seed.js';
import { seedReports } from './reports.seed.js';
import { seedOptDocuments } from './optDocuments.seed.js';
import { seedOnboarding } from './onboarding.seed.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const dropAllCollections = async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.drop();
    console.log(`Dropped collection: ${collection.collectionName}`);
  }
};

const runSeeds = async () => {
  try {
    await connectDB(MONGODB_URI); // connect once at the top

    await dropAllCollections();

    const users = await seedUsers();
    const employees = await seedEmployees(users);
    const house = await seedHouses(employees);
    await seedReports(users, house);
    await seedOnboarding(users);
    await seedOptDocuments(users);

    console.log('All seeds completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

await runSeeds();
