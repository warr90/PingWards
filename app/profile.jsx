import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { useUser } from "../contexts/UserContext";
import AppHeader from "../components/AppHeader";

export default function Profile() {
  const { userProfile, updateUserProfile } = useUser();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [timezone, setTimezone] = useState("");
  const [locale, setLocale] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [defaultView, setDefaultView] = useState("list");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setUsername(userProfile.username || "");
      setPhoneNumber(userProfile.phoneNumber || "");
      setDateOfBirth(userProfile.dateOfBirth || "");
      setGender(userProfile.gender || "");
      setTimezone(userProfile.timezone || "");
      setLocale(userProfile.locale || "");
      setAvatarUrl(userProfile.avatarUrl || "");
      setTheme(userProfile.preferences?.theme || "light");
      setNotifications(userProfile.preferences?.notifications ?? true);
      setDefaultView(userProfile.preferences?.defaultView || "list");
    }
  }, [userProfile]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant permission to access your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    if (!userProfile?.uid) return;

    setLoading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `avatars/${userProfile.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      setAvatarUrl(downloadURL);
      await updateUserProfile({ avatarUrl: downloadURL });
      Alert.alert("Success", "Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload avatar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateAvatar = () => {
    const initials = displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const colors = ["#2D8CFF", "#FF2D55", "#FFD700", "#4CAF50", "#9C27B0"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${color}"/>
        <text x="50" y="55" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy="0.35em">${initials}</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
    setAvatarUrl(dataUrl);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name is required.");
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        username: username.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender: gender.trim(),
        timezone,
        locale,
        preferences: {
          theme,
          notifications,
          defaultView,
        },
        avatarUrl,
      });
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.container}>
      <AppHeader title="Edit Profile" showProfile={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatarButtons}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
              <Text style={styles.avatarButtonText}>Upload Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={generateAvatar} style={styles.avatarButton}>
              <Text style={styles.avatarButtonText}>Generate Avatar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <TextInput
            placeholder="Display Name"
            placeholderTextColor="#ccc"
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
          />

          <TextInput
            placeholder="Username (optional)"
            placeholderTextColor="#ccc"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

          <TextInput
            placeholder="Phone Number (optional)"
            placeholderTextColor="#ccc"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            placeholder="Date of Birth (YYYY-MM-DD)"
            placeholderTextColor="#ccc"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            style={styles.input}
          />

          <TextInput
            placeholder="Gender (optional)"
            placeholderTextColor="#ccc"
            value={gender}
            onChangeText={setGender}
            style={styles.input}
          />

          <TextInput
            placeholder="Timezone (e.g., America/New_York)"
            placeholderTextColor="#ccc"
            value={timezone}
            onChangeText={setTimezone}
            style={styles.input}
          />

          <TextInput
            placeholder="Locale (e.g., en-US)"
            placeholderTextColor="#ccc"
            value={locale}
            onChangeText={setLocale}
            style={styles.input}
          />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Theme</Text>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                onPress={() => setTheme("light")}
                style={[styles.themeButton, theme === "light" && styles.themeButtonActive]}
              >
                <Text style={[styles.themeButtonText, theme === "light" && styles.themeButtonTextActive]}>
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTheme("dark")}
                style={[styles.themeButton, theme === "dark" && styles.themeButtonActive]}
              >
                <Text style={[styles.themeButtonText, theme === "dark" && styles.themeButtonTextActive]}>
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#2D8CFF" }}
              thumbColor={notifications ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Default View</Text>
            <View style={styles.viewButtons}>
              <TouchableOpacity
                onPress={() => setDefaultView("list")}
                style={[styles.viewButton, defaultView === "list" && styles.viewButtonActive]}
              >
                <Text style={[styles.viewButtonText, defaultView === "list" && styles.viewButtonTextActive]}>
                  List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDefaultView("calendar")}
                style={[styles.viewButton, defaultView === "calendar" && styles.viewButtonActive]}
              >
                <Text style={[styles.viewButtonText, defaultView === "calendar" && styles.viewButtonTextActive]}>
                  Calendar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2D8CFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  avatarButtons: {
    flexDirection: "row",
    gap: 10,
  },
  avatarButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  avatarButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: "#fff",
    fontSize: 16,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  preferenceLabel: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  themeButtons: {
    flexDirection: "row",
    gap: 10,
  },
  themeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  themeButtonActive: {
    backgroundColor: "#fff",
  },
  themeButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  themeButtonTextActive: {
    color: "#2D8CFF",
  },
  viewButtons: {
    flexDirection: "row",
    gap: 10,
  },
  viewButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  viewButtonActive: {
    backgroundColor: "#fff",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  viewButtonTextActive: {
    color: "#2D8CFF",
  },
  saveButton: {
    backgroundColor: "#2D8CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
