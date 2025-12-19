// import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import { EMPLOYEE_IDS, USER_IDS } from '../utils/ids.js';
import User from '../models/User.js';
// import db connection
// import the models

export const seedUsers = async () => {
	try {
		await User.deleteMany({});

		await User.insertMany([
			{
				_id: USER_IDS.TEST_FIRST_HR,
				username: 'testhr',
				email: 'testhr@domain.com',
				password: await bcrypt.hash('@TesthrPW123', 10),
				role: 'HR',
			},
			{
				_id: USER_IDS.TEST_FIRST_EMPLOYEE,
				username: 'testemployee',
				email: 'testemployee@domain.com',
				password: await bcrypt.hash('@TestemployeePW123', 10),
				role: 'EMPLOYEE',
				employeeProfile: EMPLOYEE_IDS.FIRST,
			},
		]);

		// process.exit(0);
	} catch (err) {
		console.error(err);
		// process.exit(1);
	}
};
