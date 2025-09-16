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

const firebaseConfig = {
  apiKey: "AIzaSyB9azV_a0rex8ZwxDwnuK9VNTEw5rLbhHI",
  authDomain: "chatwards-5f9be.firebaseapp.com",
  projectId: "chatwards-5f9be",
  storageBucket: "chatwards-5f9be.firebasestorage.app",
  messagingSenderId: "537709732623",
  appId: "1:537709732623:web:c3fca5582faade8215947a"
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
