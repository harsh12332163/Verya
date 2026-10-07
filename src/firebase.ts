import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDemo_ReplaceWithYourKey",
  authDomain: "verdant-student-success.firebaseapp.com",
  projectId: "verdant-student-success",
  storageBucket: "verdant-student-success.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.warn('Firebase initialization skipped - using local storage mode');
}

export { auth, db, storage };
export const googleProvider = new GoogleAuthProvider();
export default app;
