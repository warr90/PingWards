// firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence
} from "firebase/auth";

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDiSHnZq9sIvGJc6zhWc5N5XAvvhZXmKoU",
  authDomain: "nexaa-35ef1.firebaseapp.com",
  projectId: "nexaa-35ef1",
  storageBucket: "nexaa-35ef1.appspot.com", // ✅ FIXED typo here (was `.firebasestorage.app`)
  messagingSenderId: "799162817145",
  appId: "1:799162817145:web:e5cdd64de5b5eb422b52a8",
};

// ✅ Initialize app
const app = initializeApp(firebaseConfig);

// ✅ Setup Auth
let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// ✅ Setup Firestore
const db = getFirestore(app);

export { auth, db };
