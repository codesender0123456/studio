
import * as admin from "firebase-admin";

// This is a server-side only file.

if (!admin.apps.length) {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines from environment variables
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    try {
        if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
            throw new Error("Firebase Admin credentials are not fully set in environment variables. Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
        }
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        // Log the detailed error to the server console for debugging
        console.error("Firebase Admin SDK initialization error:", error.message);
        // Throw a more generic error to the client to avoid exposing sensitive details
        throw new Error("Firebase Admin SDK initialization failed. Check server logs for details.");
    }
}


const authAdmin = admin.auth();
const dbAdmin = admin.firestore();

export { authAdmin, dbAdmin };
