
"use server";

import admin from "firebase-admin";
import serviceAccount from "@/serviceAccountKey.json";

const appName = "firebase-admin-app";

export const initializeAdminApp = async () => {
  const existingApp = admin.apps.find((app) => app?.name === appName);
  if (existingApp) {
    return existingApp;
  }

  return admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
    },
    appName
  );
};
