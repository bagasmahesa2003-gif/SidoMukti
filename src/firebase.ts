import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjNhT536AxFrFr0h-omP_WmzUF-INQlbo",
  authDomain: "sayuran-8c9a9.firebaseapp.com",
  projectId: "sayuran-8c9a9",
  storageBucket: "sayuran-8c9a9.firebasestorage.app",
  messagingSenderId: "1065802846574",
  appId: "1:1065802846574:web:5f8ef9eac2a807f8e4317f",
  measurementId: "G-XM16WWJTMJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
