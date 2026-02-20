# Implementation Plan - Password Reset Configuration

To ensure the "Forgot Password" functionality works perfectly, you need to configure a few things in your Firebase Console. Firebase handles the actual email sending, but you must enable the service and can customize the template.

## Proposed Steps

### 1. Enable Email/Password Provider
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Select your project: **hotel-management-a8994**.
- Navigate to **Authentication** > **Sign-in method**.
- Ensure **Email/Password** is enabled.

### 2. Configure Password Reset Email Template
- In the same **Authentication** section, go to the **Templates** tab.
- Select **Password reset**.
- Here you can:
    - Change the **Sender Name** (e.g., "Anuthama Villa Support").
    - Change the **Reply-to** email address.
    - Customize the **Subject** and **Message content**.
- **Crucial**: Do not remove the `%LINK%` placeholder, as this is the actual reset link the user clicks.

### 3. Authorized Domains
- Go to **Authentication** > **Settings** > **Authorized domains**.
- Ensure `localhost` is listed (for development).
- Once you deploy your frontend (e.g., to Vercel or Netlify), add that domain here as well. If it's not added, Firebase will block the request for security reasons.

### 4. Customizing the Reset Page (Optional)
- Firebase provides a default landing page for the reset link.
- If you want a custom page (on your own website), you need to handle the `oobCode` in your React app.
- Currently, the app uses the default Firebase-hosted reset page, which is the easiest setup.

## Technical Verification
In the code I implemented (`frontend/src/pages/ForgotPassword.jsx`):
- We call `sendPasswordResetEmail(auth, email)`.
- If Firebase accepts the request, a success toast appears: `"Password reset email sent! Please check your inbox."`.
- If the email doesn't exist or there's a network error, it will show the specific error message.

## User Review Required
> Please confirm if you want me to help you set up a **custom reset landing page** inside your React app (e.g., `AnuthamaVilla.com/reset-password`), or if you are happy using the **default Firebase reset page** for now.
