
"use server";

import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

const appName = "firebase-admin-app";

// The type assertion is necessary because the JSON import may not match the `ServiceAccount` type directly.
const serviceAccountParams = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};


export const initializeAdminApp = async () => {
  const existingApp = admin.apps.find((app) => app?.name === appName);
  if (existingApp) {
    return existingApp;
  }

  return admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccountParams),
    },
    appName
  );
};
