import { connectMongo, getMongoStatus } from "./src/lib/mongodb";
import { MongoUser } from "./src/models/MongoUser";
import { MongoEnquiry } from "./src/models/MongoEnquiry";
import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEnquiryConfirmationEmail } from "./src/lib/mail";

async function runTest() {
  console.log("=== 1. TESTING MONGODB CONNECTION ===");
  const status = await getMongoStatus();
  console.log("MongoDB status:", status);
  if (!status.connected) {
    throw new Error("MongoDB is not connected!");
  }

  const testEmail = `testcustomer_${Date.now()}@example.com`;
  const initialPhone = "9876543210";
  const updatedPhone = "9123456780";
  const customerName = "Aarav Sharma";

  console.log("\n=== 2. TEST CASE A: FIRST ENQUIRY SUBMISSION (NEW CUSTOMER) ===");
  console.log(`Submitting enquiry for email: ${testEmail}, phone: ${initialPhone}`);

  // Fetch a venue from database
  const venue = await prisma.venue.findFirst();
  if (!venue) {
    throw new Error("No venue found in database to test with!");
  }
  console.log(`Using venue: ${venue.name} (${venue.id})`);

  // Simulate API POST payload
  const hash1 = await bcrypt.hash(initialPhone, 10);
  
  // 1. Prisma user create
  const newUser = await prisma.user.create({
    data: {
      name: customerName,
      email: testEmail,
      password: hash1,
      phone: initialPhone,
      role: "CUSTOMER",
    },
  });
  console.log(`Prisma user created with ID: ${newUser.id}`);

  // 2. Mongo user create
  await connectMongo();
  const mongoUser1 = await MongoUser.findOneAndUpdate(
    { email: testEmail },
    {
      $set: {
        name: customerName,
        email: testEmail,
        password: hash1,
        phone: initialPhone,
        role: "CUSTOMER",
        prismaId: newUser.id,
      },
    },
    { upsert: true, new: true }
  );
  console.log(`MongoDB user stored with Mongo ID: ${mongoUser1._id}`);

  // 3. Test Login Verification with Phone 1
  const isValidPass1 = await bcrypt.compare(initialPhone, newUser.password);
  console.log(`Password check with initial phone (${initialPhone}): ${isValidPass1 ? "SUCCESS (Matched)" : "FAILED"}`);
  if (!isValidPass1) throw new Error("Password does not match initial phone number!");

  // 4. Create enquiry in MongoDB
  const enqNum1 = `ENQ-TEST-${Date.now()}`;
  const mongoEnquiry1 = await MongoEnquiry.create({
    enquiryNumber: enqNum1,
    userId: newUser.id,
    venueId: venue.id,
    venueName: venue.name,
    customerName,
    customerPhone: initialPhone,
    customerEmail: testEmail,
    eventType: "Wedding",
    eventDate: new Date(),
    guestCount: 350,
    preferredTime: "Evening",
    budget: "₹2,00,000 - ₹3,00,000",
    services: ["Venue", "Catering"],
    message: "Need outdoor lawn and AC banquet hall.",
    status: "NEW",
  });
  console.log(`MongoDB enquiry stored: ${mongoEnquiry1.enquiryNumber}`);

  // 5. Test Mail delivery function
  console.log("\n=== 3. TESTING EMAIL SENDER & TEMPLATE ===");
  const mailResult1 = await sendEnquiryConfirmationEmail({
    customerName,
    customerEmail: testEmail,
    customerPhone: initialPhone,
    enquiryNumber: enqNum1,
    venueName: venue.name,
    eventType: "Wedding",
    eventDate: new Date(),
    guestCount: 350,
    preferredTime: "Evening",
    budget: "₹2,00,000 - ₹3,00,000",
    services: ["Venue", "Catering"],
    message: "Need outdoor lawn and AC banquet hall.",
    isNewAccount: true,
  });
  console.log("Email dispatch result:", mailResult1);

  console.log("\n=== 4. TEST CASE B: SECOND ENQUIRY WITH SAME EMAIL, DIFFERENT PHONE ===");
  console.log(`Requirement: 'if same mail already present only password replace only'`);
  console.log(`New phone number: ${updatedPhone}`);

  const hash2 = await bcrypt.hash(updatedPhone, 10);

  // Update password in Prisma
  await prisma.user.update({
    where: { id: newUser.id },
    data: { password: hash2, phone: updatedPhone },
  });

  // Update in MongoDB
  await MongoUser.findOneAndUpdate(
    { email: testEmail },
    { $set: { password: hash2, phone: updatedPhone } }
  );

  const updatedPrismaUser = await prisma.user.findUnique({ where: { email: testEmail } });
  
  // Verify old password fails
  const oldPassMatches = await bcrypt.compare(initialPhone, updatedPrismaUser!.password);
  console.log(`Login with OLD phone (${initialPhone}): ${oldPassMatches ? "FAILED (Should not match!)" : "SUCCESSFULLY REJECTED"}`);

  // Verify new password succeeds
  const newPassMatches = await bcrypt.compare(updatedPhone, updatedPrismaUser!.password);
  console.log(`Login with NEW phone (${updatedPhone}): ${newPassMatches ? "SUCCESS (Matched!)" : "FAILED"}`);

  if (oldPassMatches || !newPassMatches) {
    throw new Error("Password replacement verification failed!");
  }

  console.log("\n=== 5. VERIFYING MONGODB COLLECTIONS ===");
  const totalMongoUsers = await MongoUser.countDocuments();
  const totalMongoEnquiries = await MongoEnquiry.countDocuments();
  console.log(`Total Users in MongoDB: ${totalMongoUsers}`);
  console.log(`Total Enquiries in MongoDB: ${totalMongoEnquiries}`);

  // Clean up test data from Prisma and MongoDB
  await prisma.user.delete({ where: { id: newUser.id } });
  await MongoUser.deleteOne({ email: testEmail });
  await MongoEnquiry.deleteOne({ enquiryNumber: enqNum1 });
  console.log("Cleaned up test data.");

  console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
