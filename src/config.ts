import admin from 'firebase-admin';
const useEmulator = true;

if (useEmulator) {
  process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
}

const adminInit = () =>
  admin.initializeApp({
    // to do: move credential data to .env file
    credential: admin.credential.cert(
      '/Users/curranrobertson/projects/express-server-demo/src/fb-config.json'
    ),
    databaseURL: 'http://localhost:8080/?ns=express-server-demo'
  });

export { admin, adminInit };

// detabaseURL for using cloud storage
// https://express-server-demo-default-rtdb.europe-west1.firebasedatabase.app'
