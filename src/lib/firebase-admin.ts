
import * as admin from "firebase-admin";

// This is a server-side only file.

let app: admin.app.App | undefined;

function initializeAdmin() {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines from environment variables
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        console.error("Firebase Admin credentials are not fully set in environment variables. Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
        return null;
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error("Firebase admin initialization error:", error.message);
        return null;
    }
}

/**
 * Gets the initialized Firebase Admin services.
 * This function ensures that Firebase Admin is initialized before returning the services.
 * It should be called at the beginning of any server action that needs admin privileges.
 * @returns An object containing the auth and firestore admin services, or throws an error if initialization fails.
 */
export function getAdminServices() {
    if (!app) {
        app = initializeAdmin();
    }
    
    if (!app) {
        throw new Error("Firebase Admin SDK initialization failed. Check server logs for details. Make sure environment variables are set.");
    }

    const authAdmin = admin.auth(app);
    const dbAdmin = admin.firestore(app);

    return { authAdmin, dbAdmin };
}
