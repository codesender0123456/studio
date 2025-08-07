import * as admin from "firebase-admin";

// This is a server-side only file.
// IMPORTANT: Your service account credentials should not be in your source code.
// You should set them as environment variables in your deployment environment.

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const authAdmin = admin.auth();
export const dbAdmin = admin.firestore();
