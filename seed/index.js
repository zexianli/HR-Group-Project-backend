import { seedUsers } from "./users.seed";
import { seedEmployees } from "./employees.seed";
import { seedHouses } from "./houses.seed";

const runSeeds = async () => {
  try {
    await connectDB(); // connect once at the top

    await seedUsers();
    await seedEmployees();
    await seedHouses();

    console.log("All seeds completed ✅");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed ❌", err);
    process.exit(1);
  }
};

await runSeeds();
