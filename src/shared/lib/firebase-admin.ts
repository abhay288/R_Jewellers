import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let app: admin.app.App | null = null;

if (typeof window === 'undefined') {
  let certConfig: any = null;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    certConfig = {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
  } else {
    // Attempt to load from JSON file in the root
    try {
      const rootDir = process.cwd();
      const files = fs.readdirSync(rootDir);
      const serviceAccountFile = files.find(
        (f) => 
          f === 'firebase-service-account.json' || 
          (f.endsWith('.json') && f.includes('firebase-adminsdk'))
      );

      if (serviceAccountFile) {
        const filePath = path.join(rootDir, serviceAccountFile);
        const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (fileContent.project_id && fileContent.client_email && fileContent.private_key) {
          certConfig = {
            projectId: fileContent.project_id,
            clientEmail: fileContent.client_email,
            privateKey: fileContent.private_key,
          };
          console.log(`Firebase Admin SDK initialized using key file: ${serviceAccountFile}`);
        }
      }
    } catch (err) {
      console.warn('Could not read Firebase service account JSON file:', err);
    }
  }

  if (certConfig) {
    try {
      if (!admin.apps.length) {
        app = admin.initializeApp({
          credential: admin.credential.cert(certConfig),
        });
      } else {
        app = admin.app();
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  } else {
    console.warn(
      'Firebase Admin SDK credentials missing. Push notifications will be logged to console only.'
    );
  }
}

export { app as firebaseAdmin };
export default app;
