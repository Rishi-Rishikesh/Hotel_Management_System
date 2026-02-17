import { initializeApp } from "firebase/app";
// Commenting out analytics to prevent network issues
// import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  connectAuthEmulator,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics disabled to prevent network request failures
// const analytics = getAnalytics(app);

// Initialize Auth with network timeout settings
const auth = getAuth(app);

// Uncomment the line below if you want to use Firebase Auth Emulator for local testing
// connectAuthEmulator(auth, "http://localhost:9099");

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };



// // Import the functions you need from the SDKs you need

// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import {
//   getAuth,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
// } from "firebase/auth";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBcJTW4BSCcp7IxOS0Q_h6na8LkLjZAxw4",
//   authDomain: "hotel-management-a8994.firebaseapp.com",
//   projectId: "hotel-management-a8994",
//   storageBucket: "hotel-management-a8994.firebasestorage.app",
//   messagingSenderId: "781769966639",
//   appId: "1:781769966639:web:e93aacb6f097006f8772da",
//   measurementId: "G-FTD49RPRS0",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth(app);

// export { auth, RecaptchaVerifier, signInWithPhoneNumber };
