import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendNotification = async (email, message) => {
  try {
    await transporter.sendMail({
      from: `"Hotel Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Task Notification",
      text: message,
    });
    console.log(`[${new Date().toISOString()}] Notification sent to ${email}: ${message}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to send notification to ${email}:`, error);
    throw new Error(`Notification failed: ${error.message}`);
  }
};