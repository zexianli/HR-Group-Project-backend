import mongoose from "mongoose";
import bcrypt from "bcrypt";
// import db connection
// import the models

export const seedUsers = async () => {
  try {
    // make db connection
    // optionally delete all data in user first
    // await User.deleteMany();

    await User.insertMany([
      {
        username: "testhr",
        email: "testhr@domain.com",
        password: await bcrypt.hash("@TesthrPW123", 10),
        role: "hr",
        employeeProfile: null,
      },
      {
        username: "testemployee",
        email: "testemployee@domain.com",
        password: await bcrypt.hash("@TestemployeePW123", 10),
        role: "employee",
        employeeProfile: new mongoose.Types.ObjectId(
          "h170dwgy19by8ye29y1c2921y8128"
        ), // dummy id
      },
    ]);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
