
import admin from "firebase-admin";
// Adjust the path to your service account key file
import serviceAccount from "../../serviceAccountKey.json";

const appName = "firebase-admin-app";

export const initializeAdminApp = async () => {
  if (admin.apps.find((app) => app?.name === appName)) {
    return admin.app(appName);
  }

  return admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
    },
    appName
  );
};
