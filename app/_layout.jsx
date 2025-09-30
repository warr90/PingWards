import { Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { GoalsProvider } from "../contexts/GoalsContexts";
import { UserProvider } from "../contexts/UserContext";
import { requestNotificationPermissions, setupNotificationCategories } from "../utils/notifications";

export default function Layout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Request notification permissions and setup categories
    const setupNotifications = async () => {
      await requestNotificationPermissions();
      await setupNotificationCategories();
    };
    setupNotifications();
  }, []);

  return (
    <UserProvider>
      <GoalsProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {user ? (
            <>
              <Stack.Screen key="goals" name="goals" />
              <Stack.Screen key="goals-create" name="goals/create" options={{ title: "Create Reminder", headerShown: true }} />
              <Stack.Screen key="edit" name="edit" options={{ title: "Edit Note", headerShown: true }} />
              <Stack.Screen key="profile" name="profile" options={{ title: "Edit Profile", headerShown: true }} />
            </>
          ) : (
            <>
              <Stack.Screen key="index" name="index" />
              <Stack.Screen key="login" name="login" />
              <Stack.Screen key="signup" name="signup" />
            </>
          )}
        </Stack>
      </GoalsProvider>
    </UserProvider>
  );
}
