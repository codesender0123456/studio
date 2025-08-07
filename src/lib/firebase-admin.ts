import * as admin from "firebase-admin";

// This is a server-side only file.
// IMPORTANT: Your service account credentials should not be in your source code.
// You should set them as environment variables in your deployment environment.

let app: admin.app.App | undefined;

function initializeAdmin() {
    if (admin.apps.length) {
        app = admin.app();
        return;
    }

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        try {
            app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error: any) {
            console.error("Firebase admin initialization error", error.message);
            app = undefined;
        }
    } else {
        console.warn("Firebase Admin credentials are not fully set in environment variables. Skipping initialization.");
        app = undefined;
    }
}

initializeAdmin();

// We will throw an error if the services are not available when used in actions.
const authAdmin = app ? admin.auth(app) : null;
const dbAdmin = app ? admin.firestore(app) : null;

if (!authAdmin || !dbAdmin) {
    console.error("Firebase Admin SDK is not initialized. Make sure all environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are set correctly.");
}

export { authAdmin, dbAdmin };
