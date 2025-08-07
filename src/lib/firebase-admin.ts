
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
        const app = admin.apps[0]!;
        return {
            auth: app.auth(),
            firestore: app.firestore(),
        };
    }

    try {
        const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!serviceAccountEnv) {
            throw new Error("The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
        }

        const serviceAccount = JSON.parse(serviceAccountEnv);

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
