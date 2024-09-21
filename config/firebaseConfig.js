// firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('./neplink-firebase-adminsdk-3g4qu-4ae5341d7a.json');

let firebaseApp = null;
let db = null;

function initializeFirebase() {
  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  if (!db) {
    db = admin.database();  // Initialize the database instance
  }

  return db;
}

module.exports = initializeFirebase;
