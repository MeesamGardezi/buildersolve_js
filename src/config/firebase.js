const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * Firebase Admin SDK Initialization
 */

// Check if Firebase is already initialized
if (!admin.apps.length) {
  try {
    // Path to service account key
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
      path.join(__dirname, 'serviceAccountKey.json');

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

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

// Export Firebase services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  admin,
  db,
  auth,
  storage
};