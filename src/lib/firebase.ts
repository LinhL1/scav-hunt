import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCTVSAa6MENCLfCiFb1qo3-1Ut1SpHILIA",
  authDomain: "scav-hunt-app-72529.firebaseapp.com",
  projectId: "scav-hunt-app-72529",
  storageBucket: "scav-hunt-app-72529.firebasestorage.app",
  messagingSenderId: "446076423765",
  appId: "1:446076423765:web:0719736d3cf69e18a84edc",
  measurementId: "G-8KHK2CC49J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);