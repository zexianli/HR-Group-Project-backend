import mongoose from "mongoose";
// import db connection
// import the models

export const seedEmployees = async () => {
  try {
    // make db connection
    // optionally delete all data in user first
    // await User.deleteMany();

    await Employee.insertMany([
      {
        firstName: "Firstname",
        lastName: "Lastname",
        middleName: "Middlename",
        preferredName: "Preferred",
        profilePicture:
          "https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=612x612&w=0&k=20&c=_xCA1Y3pMvigQ9mejEAM56skgfAdBorLRqwiKckuTws=",
        dateOfBirth: new Date("2000-06-29"),
        gender: "male",
        workAuthorization: "F1",
        otherAuth: "", //what needs to be if it is not 'Other'
        workAuthorizationStart: new Date("2024-03-08"),
        workAuthorizationEnd: new Date("2029-03-08"),
        carInformation: {
          make: "Toyota",
          model: "Civic",
          color: "Silver",
        },
        driversLicense: {
          number: "1234567890",
          exp: new Date("2028-03-03"),
        },
        driversLicenseDoc:
          "https://swiftmedia.s3.amazonaws.com/mountain.swiftcom.com/images/sites/5/2016/08/11143810/Codriverslicense-atd-030116.jpg",
        cellPhone: "1234567890",
        workPhone: "0987654321",
        address: {
          num: "",
          street: "12345 67th Ave W",
          city: "Seattle",
          state: "Washington",
          zip: "98012",
        },
        reference: {
          firstName: "referrer",
          lastName: "last",
          middleName: "middle",
          phone: "1029384756",
          email: "referrer@domain.com",
          relationship: "relational",
        },
        ssn: "12345678",
        emergencyContacts: [
          {
            firstName: "first",
            lastName: "emergency",
            phone: "21548751849",
            email: "firstemerg@domain.com",
            relationship: "siblings",
          },
          {
            firstName: "second",
            lastName: "emergency",
            phone: "1452469109",
            email: "secondemerg@domain.com",
            relationship: "siblings",
          },
        ],
        houseId: new mongoose.Types.ObjectId("12geg9ey19edudw17dt12979816nd"),
        currDocumentId: new mongoose.Types.ObjectId(
          "12geg9ey19edudw17dt12979816nd"
        ),
        onBoarding: new mongoose.Types.ObjectId(
          "12geg9ey19edudw17dt12979816nd"
        ),
      },
    ]);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
