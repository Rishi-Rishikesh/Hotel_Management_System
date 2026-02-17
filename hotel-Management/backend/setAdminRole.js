import firebaseAdmin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

const uid = "FBV86dvE16N9CXToXScHLLjrMEQ2";
firebaseAdmin.auth().setCustomUserClaims(uid, { role: "Admin" })
  .then(() => {
    console.log("Admin role set successfully for user:", uid);
    return firebaseAdmin.auth().getUser(uid);
  })
  .then(userRecord => {
    console.log("User custom claims:", userRecord.customClaims);
  })
  .catch(error => {
    console.error("Error setting role:", error);
  });