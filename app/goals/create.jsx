import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { GoalsContext } from "../../contexts/GoalsContexts";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";


export default function CreateReminder() {
  const [reminderText, setReminderText] = useState("");
  const [notificationDate, setNotificationDate] = useState(() => {
    // Set default to tomorrow (no specific time)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
    return tomorrow;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { createReminder } = useContext(GoalsContext);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const handleCreateReminder = async () => {
    if (!reminderText.trim()) {
      Alert.alert("Validation", "Please enter a reminder.");
      return;
    }

    const newReminder = {
      text: reminderText.trim(),
      createdDate: new Date().toISOString(), // Store as ISO string for Firebase compatibility
      notificationDate: notificationDate.toISOString(),
      completed: false,
    };

    await createReminder(newReminder);
    setReminderText("");

    // Show success message and navigate back
    Alert.alert(
      "Success!",
      "Reminder created successfully!",
      [
        {
          text: "Create Another",
          onPress: () => setReminderText("")
        },
        {
          text: "View Reminders",
          onPress: () => router.push("/goals")
        }
      ]
    );
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      // Only set the date, keep time as midnight
      const newDate = new Date(selectedDate);
      newDate.setHours(0, 0, 0, 0);
      setNotificationDate(newDate);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation will be handled automatically by the layout component
      // when the user state changes
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Create New Reminder</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Logout"
            >
              <Text style={styles.logoutButtonText}>
                🚪 {currentUser?.displayName || currentUser?.email || 'User'} - Logout
              </Text>
            </TouchableOpacity>
          </View>



          <TextInput
            placeholder="What would you like to be reminded about?"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={reminderText}
            onChangeText={setReminderText}
            returnKeyType="done"
            onSubmitEditing={handleCreateReminder}
            multiline={true}
          />

          {/* Date Selection Section */}
          <View style={styles.dateSection}>
            <Text style={styles.dateSectionTitle}>🔔 When do you want to be reminded?</Text>
            <Text style={styles.dateSectionSubtitle}>
              Choose any date for your reminder
            </Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={openDatePicker}
            >
              <Text style={styles.datePickerButtonText}>
                📅 {notificationDate.toLocaleDateString()}
              </Text>
              <Text style={styles.datePickerSubText}>
                Tap to change date
              </Text>
            </TouchableOpacity>

          </View>

          {showDatePicker && (
            <DateTimePicker
              value={notificationDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
              minimumDate={new Date()} // Prevent selecting past dates
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleCreateReminder}>
            <Text style={styles.buttonText}>Create Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/goals")}
          >
            <Text style={styles.secondaryButtonText}>View All Reminders</Text>
          </TouchableOpacity>


        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "transparent",
    width: "90%",
    padding: 20,
    borderRadius: 15,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  dateSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF2D55",
  },
  dateSectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dateSectionSubtitle: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: "top",
  },
  datePickerButton: {
    backgroundColor: "#FF2D55",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  datePickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  datePickerSubText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  button: {
    backgroundColor: "#2D8CFF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

});
