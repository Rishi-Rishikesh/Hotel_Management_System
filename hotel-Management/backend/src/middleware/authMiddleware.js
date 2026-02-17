import admin from 'firebase-admin';
import Guest from '../models/guestModel.js';

export default function authMiddleware(allowedRoles) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Auth header:`, authHeader ? 'Bearer <redacted>' : 'None');

      // Check for Authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - No token provided`);
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      // Verify Firebase ID token
      const token = authHeader.split(' ')[1];
      console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Verifying Firebase token`);
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (error) {
        console.error(`AuthMiddleware: ${req.method} ${req.originalUrl} - Token verification failed:`, error.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
      console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Token verified. UID: ${decodedToken.uid}, Email: ${decodedToken.email}`);

      // Find user in Guest collection
      const user = await Guest.findOne({ firebaseUid: decodedToken.uid });
      if (!user) {
        console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - User not found for UID: ${decodedToken.uid}`);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - User lookup: Email: ${user.email}, Role: ${user.role}, MongoID: ${user._id}`);

      // Verify role
      if (!allowedRoles.includes(user.role)) {
        console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Access denied. User role: ${user.role}, Required roles: ${allowedRoles}`);
        return res.status(403).json({ success: false, message: `Access denied: Insufficient permissions. Role ${user.role} not in ${allowedRoles}` });
      }

      // Attach user data for both jobs
      // For Job 1: req.userId, req.userEmail, req.userRole
      req.userId = decodedToken.uid;
      req.userEmail = user.email;
      req.userRole = user.role;
      // For Job 2: req.user with mongoId, firebaseUid, email, role
      req.user = {
        mongoId: user._id.toString(),
        firebaseUid: decodedToken.uid,
        email: user.email,
        role: user.role,
      };

      console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Auth successful. Role: ${user.role}, MongoID: ${user._id}, Firebase UID: ${decodedToken.uid}`);
      next();
    } catch (error) {
      console.error(`AuthMiddleware: ${req.method} ${req.originalUrl} - Error:`, {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      if (error.code && error.code.startsWith('auth/')) {
        return res.status(401).json({ success: false, message: `Invalid token: ${error.message}` });
      }
      return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
  };
}



// import admin from "firebase-admin";
// import Guest from "../models/guestModel.js";

// export default function authMiddleware(allowedRoles) {
//   return async (req, res, next) => {
//     try {
//       const authHeader = req.headers.authorization;
//       console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Auth header:`, authHeader ? "Bearer <redacted>" : "None");
//       if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - No token provided`);
//         return res.status(401).json({ success: false, message: "No token provided" });
//       }

//       const token = authHeader.split(" ")[1];
//       console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Verifying Firebase token`);
//       const decodedToken = await admin.auth().verifyIdToken(token);
//       console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Token verified. UID: ${decodedToken.uid}, Email: ${decodedToken.email}`);

//       const user = await Guest.findOne({ firebaseUid: decodedToken.uid });
//       if (!user) {
//         console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - User not found for UID: ${decodedToken.uid}`);
//         return res.status(404).json({ success: false, message: "User not found" });
//       }
//       console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - User lookup: Email: ${user.email}, Role: ${user.role}`);

//       if (!allowedRoles.includes(user.role)) {
//         console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Access denied. User role: ${user.role}, Required roles: ${allowedRoles}`);
//         return res.status(403).json({ success: false, message: `Access denied: Insufficient permissions. Role ${user.role} not in ${allowedRoles}` });
//       }

//       req.userId = decodedToken.uid;
//       req.userEmail = user.email;
//       req.userRole = user.role;
//       console.log(`AuthMiddleware: ${req.method} ${req.originalUrl} - Auth successful. Role: ${user.role}, UID: ${decodedToken.uid}`);
//       next();
//     } catch (error) {
//       console.error(`AuthMiddleware: ${req.method} ${req.originalUrl} - Error:`, {
//         message: error.message,
//         code: error.code,
//         stack: error.stack,
//       });
//       if (error.code && error.code.startsWith("auth/")) {
//         return res.status(401).json({ success: false, message: `Invalid token: ${error.message}` });
//       }
//       return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
//     }
//   };
// }
