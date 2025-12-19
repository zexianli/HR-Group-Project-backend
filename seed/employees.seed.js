// import mongoose from "mongoose";
import { EMPLOYEE_IDS, HOUSE_IDS } from '../utils/ids.js';
import Employee from '../models/Employee.js';
// import db connection
// import the models

export const seedEmployees = async () => {
	try {
		await Employee.deleteMany({});

		await Employee.insertMany([
			{
				_id: EMPLOYEE_IDS.FIRST,
				firstName: 'Alice',
				lastName: 'Wu',
				middleName: 'Constance',
				preferredName: 'Alice',
				profilePictureUrl:
					'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=612x612&w=0&k=20&c=_xCA1Y3pMvigQ9mejEAM56skgfAdBorLRqwiKckuTws=',
				dateOfBirth: new Date('2000-06-29'),
				gender: 'Female',
				workAuthorization: 'F1(CPT/OPT)',
				otherAuth: '', //what needs to be if it is not 'Other'
				workAuthorizationStart: new Date('2024-03-08'),
				workAuthorizationEnd: new Date('2029-03-08'),
				carInformation: {
					make: 'Toyota',
					model: 'Civic',
					color: 'Silver',
				},
				driverLicense: {
					number: '1234567890',
					exp: new Date('2028-03-03'),
				},
				driverLicenseDoc:
					'https://swiftmedia.s3.amazonaws.com/mountain.swiftcom.com/images/sites/5/2016/08/11143810/Codriverslicense-atd-030116.jpg',
				cellPhone: '1234567890',
				workPhone: '0987654321',
				address: {
					num: '',
					street: '12345 67th Ave W',
					city: 'Seattle',
					state: 'Washington',
					zip: '98012',
				},
				references: [
					{
						firstName: 'Manny',
						lastName: 'Pacquiao',
						relationship: 'relational',
						phone: '1029384756',
						email: 'firstref@domain.com',
					},
					{
						firstName: 'Floyd',
						lastName: 'Mayweather',
						relationship: 'relational',
						phone: '1029384756',
						email: 'secondref@domain.com',
					},
				],
				ssn: '12345678',
				emergencyContacts: [
					{
						firstName: 'first',
						lastName: 'emergency',
						middleName: 'middle',
						phone: '21548751849',
						email: 'firstemerg@domain.com',
						relationship: 'siblings',
					},
					{
						firstName: 'second',
						lastName: 'emergency',
						middleName: 'middle',
						phone: '1452469109',
						email: 'secondemerg@domain.com',
						relationship: 'parent',
					},
				],
				houseId: HOUSE_IDS.FIRST,
				// currDocumentId and onboarding I set to null
			},
		]);

		// process.exit(0);
	} catch (err) {
		console.error(err);
		// process.exit(1);
	}
};
