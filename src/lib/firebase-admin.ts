
"use server";

import admin, { App } from "firebase-admin";

const appName = "firebase-admin-app-" + Date.now();

const serviceAccountParams = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_ADMIN_CLIENT_ID,
  authUri: process.env.FIREBASE_ADMIN_AUTH_URI,
  tokenUri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  authProviderX509CertUrl: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  clientC509CertUrl: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
};

export async function initializeAdminApp(): Promise<App> {
  const existingApp = admin.apps.find((app) => app?.name === appName);
  if (existingApp) {
    return existingApp;
  }

  // Type assertion for the credential object
  const credential = admin.credential.cert({
    projectId: serviceAccountParams.projectId,
    clientEmail: serviceAccountParams.clientEmail,
    privateKey: serviceAccountParams.privateKey,
  });

  return admin.initializeApp(
    {
      credential,
    },
    appName
  );
}
