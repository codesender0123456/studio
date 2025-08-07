
import * as admin from "firebase-admin";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

interface AdminServices {
    auth: Auth;
    firestore: Firestore;
}

// This is a cached, lazily-initialized instance of our admin services.
let adminServices: AdminServices | null = null;

function getAdminServices(): AdminServices {
    // If we've already initialized, just return the cached services.
    if (adminServices) {
        return adminServices;
    }

    // If no apps are initialized, initialize a new one.
    if (admin.apps.length === 0) {
        try {
            const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
            if (!serviceAccountEnv) {
                throw new Error("The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
            }

            const serviceAccount = JSON.parse(serviceAccountEnv);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error);
            // Throw a more specific error to the client to help with debugging.
            throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
        }
    }
    
    // Get the (now initialized) default app.
    const app = admin.app();

    // Cache the services and return them.
    adminServices = {
        auth: app.auth(),
        firestore: app.firestore(),
    };
    
    return adminServices;
}

// These are functions that components/actions can call to get the services.
export const getAuth = () => getAdminServices().auth;
export const getFirestore = () => getAdminServices().firestore;
