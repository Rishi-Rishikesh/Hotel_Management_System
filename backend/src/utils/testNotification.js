import { sendNotification } from "./notification.js";

const testEmail = async () => {
  try {
    await sendNotification("test-recipient@example.com", "This is a test notification from Nodemailer");
    console.log("Test email sent successfully");
  } catch (error) {
    console.error("Test email failed:", error);
  }
};

testEmail();