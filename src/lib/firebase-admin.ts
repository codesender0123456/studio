import * as admin from "firebase-admin";

// This is a server-side only file.
// IMPORTANT: Your service account credentials should not be in your source code.
// You should set them as environment variables in your deployment environment.

let app: admin.app.App;

if (!admin.apps.length) {
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
    // You might want to throw the error or handle it in a way that
    // prevents the rest of the app from running without Firebase.
  }
} else {
  app = admin.app();
}


export const authAdmin = admin.auth(app);
export const dbAdmin = admin.firestore(app);
