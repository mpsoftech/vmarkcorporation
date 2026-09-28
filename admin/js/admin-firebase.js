/**
 * V MARK CORPORATION - Firebase SDK Configuration for Admin & Client
 * Connected to:
 * - Cloud Firestore Database: "vmarkcorporation"
 * - Cloud Storage Bucket: "gs://vmark-corporation.firebasestorage.app"
 */
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  onSnapshot 
} from "firebase/firestore";
import { 
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updatePassword,
  updateProfile
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAEKBeyYlg5T5cvwZvNTUx5vmaWJIeVUvc",
  authDomain: "vmark-corporation.firebaseapp.com",
  projectId: "vmark-corporation",
  storageBucket: "vmark-corporation.firebasestorage.app",
  messagingSenderId: "759926371618",
  appId: "1:759926371618:web:e550ac1c4f429d3e56217b",
  measurementId: "G-KR4TRHHK7G"
};

// Initialize or reuse app
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Services - explicitly targeting named database "vmarkcorporation" and storage bucket "gs://vmark-corporation.firebasestorage.app"
export const db = getFirestore(app, "vmarkcorporation");
export const storage = getStorage(app, "gs://vmark-corporation.firebasestorage.app");
export const auth = getAuth(app);

export {
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  onSnapshot,
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updatePassword,
  updateProfile
};
