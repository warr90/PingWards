import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Medium");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const { createReminder } = useContext(GoalsContext);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsubscribe;
  }, []);

  const handleCreateReminder = async () => {
    if (!reminderText.trim()) {
      Alert.alert("Validation", "Please enter a reminder.");
      return;
    }

    // Validate notification date
    if (!notificationDate || isNaN(notificationDate.getTime())) {
      Alert.alert("Validation", "Please select a valid date for your reminder.");
      return;
    }

    const newReminder = {
      text: reminderText.trim(),
      createdDate: new Date().toISOString(), // Store as ISO string for Firebase compatibility
      notificationDate: notificationDate.toISOString(),
      completed: false,
      category,
      priority,
      tags,
    };

    await createReminder(newReminder);
    setReminderText("");
    setTags([]);
    setTagInput("");

    // Show success message and navigate back
    Alert.alert(
      "Success!",
      "Reminder created successfully!",
      [
        {
          text: "Create Another",
          onPress: () => {
            setReminderText("");
            setTags([]);
            setTagInput("");
          }
        },
        {
          text: "View Reminders",
          onPress: () => router.push("/goals")
        }
      ]
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || notificationDate;

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (currentDate && !isNaN(new Date(currentDate).getTime())) {
      // Only set the date, keep time as midnight
      const newDate = new Date(currentDate);
      newDate.setHours(0, 0, 0, 0);
      setNotificationDate(newDate);
    }

    // For iOS, close the picker when done or dismissed
    if (Platform.OS === 'ios') {
      if (event?.type === 'set' || event?.type === 'dismissed') {
        setShowDatePicker(false);
      }
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

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

  return (
<LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior="padding"
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Create New Reminder</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => Alert.alert("Profile", `Name: ${currentUser?.displayName || 'N/A'}\nEmail: ${currentUser?.email || 'N/A'}`)}
                accessibilityLabel="Profile"
              >
                <Ionicons name="person-circle" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                accessibilityLabel="Logout"
              >
                <Text style={styles.logoutButtonText}>🚪 Logout</Text>
              </TouchableOpacity>
            </View>
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

            {Platform.OS === 'web' ? (
              <TextInput
                style={styles.dateInput}
                type="date"
                value={notificationDate && !isNaN(notificationDate.getTime()) ? notificationDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onChangeText={(text) => {
                  if (text) {
                    try {
                      const newDate = new Date(text);
                      if (!isNaN(newDate.getTime())) {
                        newDate.setHours(0, 0, 0, 0);
                        setNotificationDate(newDate);
                      }
                    } catch (error) {
                      console.error('Invalid date input:', error);
                    }
                  }
                }}
                placeholder="Select date"
                min={new Date().toISOString().split('T')[0]}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={openDatePicker}
                >
                  <Text style={styles.datePickerButtonText}>
                    📅 {notificationDate && !isNaN(notificationDate.getTime()) ? notificationDate.toLocaleDateString() : 'Select Date'}
                  </Text>
                  <Text style={styles.datePickerSubText}>
                    Tap to change date
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={notificationDate && !isNaN(notificationDate.getTime()) ? notificationDate : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "calendar"}
                    onChange={onChangeDate}
                    minimumDate={new Date()} // Prevent selecting past dates
                  />
                )}
              </>
            )}
          </View>

          {/* Category Selection */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.pickerContainer}>
              {["General", "Work", "Personal", "Health", "Education"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pickerOption, category === cat && styles.pickerOptionSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.pickerOptionText, category === cat && styles.pickerOptionTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Selection */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.pickerContainer}>
              {["Low", "Medium", "High"].map((pri) => (
                <TouchableOpacity
                  key={pri}
                  style={[styles.pickerOption, priority === pri && styles.pickerOptionSelected]}
                  onPress={() => setPriority(pri)}
                >
                  <Text style={[styles.pickerOptionText, priority === pri && styles.pickerOptionTextSelected]}>
                    {pri}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                placeholder="Add a tag..."
                placeholderTextColor="#ccc"
                value={tagInput}
                onChangeText={setTagInput}
                style={styles.tagInput}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Text style={styles.addTagButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileButton: {
    padding: 8,
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
  dateInput: {
    backgroundColor: "#FF2D55",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
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
  fieldSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF2D55",
  },
  fieldLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickerOption: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pickerOptionSelected: {
    backgroundColor: "#FF2D55",
    borderColor: "#fff",
  },
  pickerOptionText: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "600",
  },
  pickerOptionTextSelected: {
    color: "#fff",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: "#2D8CFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addTagButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

});
