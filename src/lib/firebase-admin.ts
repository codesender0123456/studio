
import * as admin from "firebase-admin";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

interface AdminServices {
    auth: Auth;
    firestore: Firestore;
}

let services: AdminServices | null = null;

function initializeAdminApp(): AdminServices {
    if (admin.apps.length > 0) {
        if (services) {
            return services;
        }
        const app = admin.apps[0]!;
        services = {
            auth: app.auth(),
            firestore: app.firestore(),
        };
        return services;
    }

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Firebase Admin credentials are not fully set in environment variables. Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
    }

    try {
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        services = {
            auth: app.auth(),
            firestore: app.firestore(),
        };
        return services;
    } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error);
        // Throw a more specific error to the client to help with debugging.
        throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
    }
}

export function getAdminServices(): AdminServices {
    if (services) {
        return services;
    }
    return initializeAdminApp();
}

// Keeping these for any files that might still use them, but encouraging getAdminServices
const { auth: authAdmin, firestore: dbAdmin } = getAdminServices();
export { authAdmin, dbAdmin };
