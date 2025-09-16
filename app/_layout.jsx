import { Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useEffect, useState } from "react";

export default function Layout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen key="goals" name="goals" />
          <Stack.Screen key="create" name="create" options={{ title: "Create Note", headerShown: true }} />
          <Stack.Screen key="edit" name="edit" options={{ title: "Edit Note", headerShown: true }} />
        </>
      ) : (
        <>
          <Stack.Screen key="index" name="index" />
          <Stack.Screen key="signup" name="signup" />
        </>
      )}
    </Stack>
  );
}
