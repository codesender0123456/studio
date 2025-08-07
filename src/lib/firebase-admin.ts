import * as admin from "firebase-admin";

// This is a server-side only file.
// IMPORTANT: Your service account credentials should not be in your source code.
// You should set them as environment variables in your deployment environment.

let app: admin.app.App;

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  try {
    // Check if all required environment variables are present
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn("Firebase Admin credentials are not fully set. Skipping initialization.");
    }
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.message);
  }
} else {
  app = admin.app();
}

// Ensure app is defined before exporting auth and db
const authAdmin = app ? admin.auth(app) : null;
const dbAdmin = app ? admin.firestore(app) : null;


// We will throw an error if the services are not available when used in actions.
if (!authAdmin || !dbAdmin) {
    console.error("Firebase Admin SDK is not initialized. Make sure all environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are set correctly.");
}

export { authAdmin, dbAdmin };
