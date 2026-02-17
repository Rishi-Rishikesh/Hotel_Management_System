import dotenv from "dotenv";
dotenv.config();

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("Valid JSON:", serviceAccount);
  console.log("Valid PEM private_key:", serviceAccount.private_key.includes("BEGIN PRIVATE KEY"));
} catch (error) {
  console.error("JSON Parse Error:", error.message);
}