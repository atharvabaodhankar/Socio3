// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhTfa32_Yx8bv78TtkBh58SrY8Dl2KIEw",
  authDomain: "socio3-3c5a3.firebaseapp.com",
  projectId: "socio3-3c5a3",
  storageBucket: "socio3-3c5a3.firebasestorage.app",
  messagingSenderId: "668848911595",
  appId: "1:668848911595:web:628bfde51632c32c68faae",
  measurementId: "G-73F08THNBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, analytics };
export default app;