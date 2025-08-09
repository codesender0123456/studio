
"use server";

import admin, { App } from "firebase-admin";

const appName = "firebase-admin-app-" + Date.now();

// These environment variables now directly match the keys in your serviceAccountKey.json file.
const serviceAccountParams = {
  type: process.env.type,
  projectId: process.env.project_id,
  privateKeyId: process.env.private_key_id,
  privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
  clientEmail: process.env.client_email,
  clientId: process.env.client_id,
  authUri: process.env.auth_uri,
  tokenUri: process.env.token_uri,
  authProviderX509CertUrl: process.env.auth_provider_x509_cert_url,
  clientC509CertUrl: process.env.client_x509_cert_url,
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
