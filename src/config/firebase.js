import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Firebase Admin SDK Initialization
 */

// Check if Firebase is already initialized
if (!admin.apps.length) {
  try {
    // Path to service account key
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
      join(__dirname, 'serviceAccountKey.json');

    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'stillfeed-1.firebasestorage.app',
    });

    console.log('✓ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('✗ Firebase initialization error:', error.message);
    console.error('Make sure you have created config/serviceAccountKey.json');
    process.exit(1);
  }
}

export default admin;