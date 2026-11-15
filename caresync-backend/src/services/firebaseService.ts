import * as admin from 'firebase-admin';

export function initializeFirebase() {
  if (admin.apps.length === 0) {
    // In Cloud Run, use Application Default Credentials
    // Locally, use GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
    admin.initializeApp({
      credential: process.env.FIREBASE_SERVICE_ACCOUNT
        ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
        : admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('✅ Firebase Admin initialized');
  }
  return admin;
}

export const db = () => admin.firestore();
export const auth = () => admin.auth();
export { admin };
