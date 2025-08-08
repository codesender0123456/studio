
"use server";

import admin from "firebase-admin";
// Adjust the path to your service account key file
import serviceAccount from "../serviceAccountKey.json";

const appName = "firebase-admin-app";

export const initializeAdminApp = () => {
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
