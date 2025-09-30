import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';

const AppHeader = ({ title, showProfile = true, showLogout = true, customActions = [] }) => {
  const router = useRouter();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to logout?")) {
        signOut(auth).then(() => router.replace("/login")).catch(error => console.error(error));
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/login");
            } catch (error) {
              console.error("Error signing out:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }},
        ]
      );
    }
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <View style={styles.header}>
      <Text style={styles.heading}>{title}</Text>
      <View style={styles.headerActions}>
        {customActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.customAction}
            onPress={action.onPress}
          >
            {action.icon}
          </TouchableOpacity>
        ))}
        {showProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfile}
            accessibilityLabel="Profile"
          >
            <Ionicons name="person-circle" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {showLogout && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityLabel="Logout"
          >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileButton: {
    padding: 8,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  customAction: {
    padding: 8,
  },
};

export default AppHeader;
