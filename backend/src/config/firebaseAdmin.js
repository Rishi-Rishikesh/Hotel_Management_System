import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!admin.apps.length) {
  try {
    // Try multiple possible paths for the service account key to be extremely robust
    const pathsToTry = [
      join(__dirname, "../../serviceAccountKey.json"),
      join(process.cwd(), "serviceAccountKey.json"),
      join(process.cwd(), "backend", "serviceAccountKey.json")
    ];

    let serviceAccount = null;
    let successfulPath = null;

    for (const path of pathsToTry) {
      try {
        console.log("Checking for Firebase key at:", path);
        const content = readFileSync(path, "utf8");
        serviceAccount = JSON.parse(content);
        successfulPath = path;
        break; // Found it!
      } catch (e) {
        // Continue to next possible path
      }
    }

    if (!serviceAccount) {
      throw new Error(`Could not find serviceAccountKey.json. Tried: ${pathsToTry.join(", ")}`);
    }

    console.log("✅ Successfully loaded Firebase key from:", successfulPath);

    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error("Invalid Firebase service account: Missing required fields (project_id, private_key, or client_email)");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("❌ CRITICAL: Failed to initialize Firebase Admin SDK:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    // DON'T exit - let server start so we can debug
    console.error("⚠️  WARNING: Server will start but Firebase authentication will NOT work!");
  }
} else {
  console.log("Firebase Admin SDK already initialized");
}

export default admin;