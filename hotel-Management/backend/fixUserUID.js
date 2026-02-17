import mongoose from 'mongoose';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);

// Guest model
const Guest = mongoose.model('Guest', new mongoose.Schema({
    email: String,
    firebaseUid: String,
    password: String,
    role: String,
    status: String,
}));

async function fixUserFirebaseUID(email) {
    try {
        console.log(`\nFixing Firebase UID for: ${email}`);

        // Get user from Firebase by email
        const firebaseUser = await admin.auth().getUserByEmail(email);
        console.log(`Found in Firebase with UID: ${firebaseUser.uid}`);

        // Update MongoDB user
        const result = await Guest.findOneAndUpdate(
            { email: email },
            { $set: { firebaseUid: firebaseUser.uid } },
            { new: true }
        );

        if (result) {
            console.log(`✅ Successfully updated MongoDB user!`);
            console.log(`Email: ${result.email}`);
            console.log(`Firebase UID: ${result.firebaseUid}`);
            console.log(`Role: ${result.role}`);
        } else {
            console.log(`❌ User not found in MongoDB`);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

// Fix the user - CHANGE THIS EMAIL to your email
await fixUserFirebaseUID('jikinik369@bdnets.com');

// Close connections
await mongoose.connection.close();
process.exit(0);
