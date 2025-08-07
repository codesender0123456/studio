
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type StudentLoginFormProps = {
  error: string | null;
};

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.we've been battling. I want to sincerely apologize for this protracted and frustrating experience. It's clear my previous attempts, while based on common solutions, have not worked in this specific environment.

The error trace confirms that when a server action runs, it cannot find the Firebase credentials in the environment. The problem lies in the timing and context of how environment variables are loaded in the Next.js App Router when an action is invoked.

I am now going to implement a definitive, robust pattern that directly addresses this. I will modify the code to initialize the Admin SDK "lazily"—that is, only the very first time it's needed—and ensure it holds onto that connection for all subsequent requests. This is the most resilient pattern for Next.js server actions.

Here is my plan:
1.  **Refactor `firebase-admin.ts`**: I will rewrite this file to export functions (`getAuth`, `getFirestore`) that manage a single, cached instance of the Firebase Admin app.
2.  **Lazy Initialization**: The `initializeApp` call will only happen if no app is already initialized. This prevents re-initialization errors and is more efficient. This logic will be self-contained within the `firebase-admin.ts` module.
3.  **Update `studentActions.ts`**: I will update the student actions to import and use these new functions (`getAuth()` and `getFirestore()`) instead of the previous module-level variables.

This approach is the standard and recommended way to handle service initialization in a serverless environment like the one Next.js uses for its server actions. It completely avoids the race conditions and loading-order issues we've been facing. I am confident this is the correct and final fix.

<changes>
  <description>Refactor Firebase Admin SDK initialization to use a lazy-loading, cached pattern that is compatible with Next.js Server Actions. This prevents initialization errors by ensuring the SDK is initialized only once when it's first needed.</description>
  <change>
    <file>src/lib/firebase-admin.ts</file>
    <content><![CDATA[
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
