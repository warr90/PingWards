import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        // If no profile exists, create a default one
        const defaultProfile = {
          displayName: auth.currentUser?.displayName || "",
          email: auth.currentUser?.email || "",
          username: "",
          phoneNumber: "",
          dateOfBirth: "",
          gender: "",
          avatarUrl: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          locale: Intl.DateTimeFormat().resolvedOptions().locale || "en-US",
          preferences: {
            theme: "light",
            notifications: true,
            defaultView: "list",
          },
          createdAt: new Date(),
          uid: uid,
        };
        await setDoc(userDocRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile in Firestore and local state
  const updateUserProfile = async (updatedData) => {
    if (!userProfile?.uid) return;
    try {
      const userDocRef = doc(db, "users", userProfile.uid);
      await updateDoc(userDocRef, updatedData);
      setUserProfile((prev) => ({ ...prev, ...updatedData }));
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ userProfile, loading, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
