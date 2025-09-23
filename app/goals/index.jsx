import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { GoalsContext } from "../../contexts/GoalsContexts";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const tabs = ["View Reminders", "Daily Boost"];

const motivationalMessages = [
  "🚀 Keep pushing! Your goals are closer than you think!",
  "🔥 Stay focused. Your future self will thank you.",
  "🌟 Small steps every day lead to big results!",
  "💡 Reminders are your secret weapon to success.",
];

export default function ReminderTabs() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { reminders, deleteReminder, fetchReminders, updateReminder } = useContext(GoalsContext);
  const router = useRouter();

  const randomMotivation =
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  useEffect(() => {
    fetchReminders();
  }, []);

  const formatDate = (dateInput) => {
    try {
      // Handle null, undefined, or empty values
      if (!dateInput) {
        return 'Invalid Date';
      }

      // Handle different date formats
      let dateObj;
      if (typeof dateInput === 'string') {
        // Try to parse the string as a date
        dateObj = new Date(dateInput);
        // If it's an invalid date string, try to extract timestamp
        if (isNaN(dateObj.getTime()) && dateInput.includes('T')) {
          // Handle Firebase timestamp format
          const timestamp = Date.parse(dateInput);
          if (!isNaN(timestamp)) {
            dateObj = new Date(timestamp);
          }
        }
      } else if (dateInput instanceof Date) {
        dateObj = dateInput;
      } else if (typeof dateInput === 'object' && dateInput._seconds) {
        // Handle Firebase Timestamp object
        dateObj = new Date(dateInput._seconds * 1000);
      } else {
        return 'Invalid Date';
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ", " + dateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateInput);
      return 'Invalid Date';
    }
  };

  const formatDateOnly = (dateInput) => {
    try {
      // Handle null, undefined, or empty values
      if (!dateInput) {
        return 'Invalid Date';
      }

      // Handle different date formats
      let dateObj;
      if (typeof dateInput === 'string') {
        dateObj = new Date(dateInput);
        if (isNaN(dateObj.getTime()) && dateInput.includes('T')) {
          const timestamp = Date.parse(dateInput);
          if (!isNaN(timestamp)) {
            dateObj = new Date(timestamp);
          }
        }
      } else if (dateInput instanceof Date) {
        dateObj = dateInput;
      } else if (typeof dateInput === 'object' && dateInput._seconds) {
        dateObj = new Date(dateInput._seconds * 1000);
      } else {
        return 'Invalid Date';
      }

      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      // Only return date, no time
      return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateInput);
      return 'Invalid Date';
    }
  };

  const openEditModal = (reminder) => {
    setEditingReminder(reminder);
    setEditText(reminder.text);
    const reminderDate = new Date(reminder.notificationDate);
    setEditDate(reminderDate);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingReminder(null);
    setEditText("");
    setEditDate(new Date());
    setShowDatePicker(false);
    setIsUpdating(false);
  };

  const handleUpdateReminder = async () => {
    if (!editText.trim()) {
      Alert.alert("Validation", "Please enter a reminder.");
      return;
    }

    if (isUpdating) return; // Prevent multiple submissions

    setIsUpdating(true);

    try {
      const updatedReminder = {
        text: editText.trim(),
        notificationDate: editDate.toISOString(),
      };

      await updateReminder(editingReminder.id, updatedReminder);

      // Refresh reminders to show updated data
      await fetchReminders();

      // Close modal immediately after successful update
      closeEditModal();

      // Show success message after modal is closed
      setTimeout(() => {
        Alert.alert("Success!", "Reminder updated successfully!");
      }, 300);

    } catch (error) {
      console.error("Error updating reminder:", error);
      Alert.alert("Error", "Failed to update reminder. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const onChangeEditDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      setEditDate(selectedDate);
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
            <Text style={styles.heading}>My Reminders</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Logout"
            >
              <Text style={styles.logoutButtonText}>
                🚪 Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab bar */}
          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  selectedTab === tab && styles.selectedTab,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.selectedTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* View Reminders Tab */}
          {selectedTab === "View Reminders" && (
            <View style={styles.listContainer}>
              {reminders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.noReminders}>No reminders yet.</Text>
                  <Text style={styles.noRemindersSubtext}>
                    Create your first reminder to get started!
                  </Text>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push("/goals/create")}
                  >
                    <Text style={styles.createButtonText}>Create New Reminder</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.headerRow}>
                    <Text style={styles.listHeading}>Your Reminders:</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => router.push("/goals/create")}
                    >
                      <Text style={styles.addButtonText}>+ Add New</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={reminders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.listItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listItemText}>{item.text}</Text>

                          {/* Date Information Header */}
                          <Text style={styles.dateInfoHeader}>📅 Date Information:</Text>

                          {/* Creation Date - smaller and less prominent */}
                          <View style={styles.creationDateSection}>
                            <Text style={styles.creationDateLabel}>📅 CREATED:</Text>
                            <Text style={styles.creationDateText}>
                              {formatDate(item.createdDate)}
                            </Text>
                            <Text style={styles.creationDateSubtext}>
                              This is when you made this reminder
                            </Text>
                          </View>

                          {/* Reminder Date - prominent and highlighted */}
                          <View style={styles.reminderDateSection}>
                            <Text style={styles.reminderDateLabel}>🔔 REMIND ME:</Text>
                            <Text style={styles.reminderDateText}>
                              {formatDateOnly(item.notificationDate)}
                            </Text>
                            <Text style={styles.reminderDateSubtext}>
                              This is when you'll get notified
                            </Text>
                          </View>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => openEditModal(item)}
                            accessibilityLabel={`Edit reminder: ${item.text}`}
                          >
                            <Text style={styles.editButtonText}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteReminder(item.id)}
                            accessibilityLabel={`Delete reminder: ${item.text}`}
                          >
                            <Text style={styles.deleteButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                </>
              )}
            </View>
          )}

          {/* Daily Boost Tab */}
          {selectedTab === "Daily Boost" && (
            <View style={styles.motivationContainer}>
              <Text style={styles.motivationText}>{randomMotivation}</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.modalInner}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <View style={styles.modalCard}>
                <Text style={styles.modalHeading}>Edit Reminder</Text>

                <TextInput
                  placeholder="What would you like to be reminded about?"
                  placeholderTextColor="#ccc"
                  style={styles.modalInput}
                  value={editText}
                  onChangeText={setEditText}
                  returnKeyType="done"
                  onSubmitEditing={handleUpdateReminder}
                  multiline={true}
                />

                {/* Date Selection Section */}
                <View style={styles.modalDateSection}>
                  <Text style={styles.modalDateSectionTitle}>🔔 When do you want to be reminded?</Text>
                  <Text style={styles.modalDateSectionSubtitle}>
                    Choose any date and time for your reminder
                  </Text>
                  <TouchableOpacity
                    style={styles.modalDatePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.modalDatePickerButtonText}>
                      📅 {editDate.toLocaleDateString()} at {editDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                    <Text style={styles.modalDatePickerSubText}>
                      Tap to change date and time
                    </Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={editDate}
                    mode="datetime"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeEditDate}
                    minimumDate={new Date()}
                  />
                )}

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalUpdateButton, isUpdating && styles.modalUpdateButtonDisabled]}
                    onPress={handleUpdateReminder}
                    disabled={isUpdating}
                  >
                    <Text style={styles.modalUpdateButtonText}>
                      {isUpdating ? "Updating..." : "Update Reminder"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={closeEditModal}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </Modal>
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
    marginBottom: 30,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
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
  tabBar: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#2D8CFF",
    borderRadius: 10,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#2D8CFF",
  },
  selectedTab: {
    backgroundColor: "#FF2D55",
  },
  tabText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedTabText: {
    color: "#fff",
  },
  listContainer: {
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  listHeading: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  addButton: {
    backgroundColor: "#FF2D55",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#2D8CFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "rgba(45, 140, 255, 0.2)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateInfoHeader: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  creationDateSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#999",
  },
  creationDateLabel: {
    color: "#999",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  creationDateText: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 2,
  },
  creationDateSubtext: {
    color: "#888",
    fontSize: 11,
    fontStyle: "italic",
  },
  reminderDateSection: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  reminderDateLabel: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  reminderDateText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  reminderDateSubtext: {
    color: "#66BB6A",
    fontSize: 11,
    fontStyle: "italic",
  },
  deleteButton: {
    backgroundColor: "#FF2D55",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 15,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 15,
  },
  editButton: {
    backgroundColor: "#2D8CFF",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    lineHeight: 20,
  },
  noReminders: {
    color: "#ccc",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  noRemindersSubtext: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  motivationContainer: {
    backgroundColor: "#FF2D55",
    borderRadius: 12,
    padding: 25,
    marginHorizontal: 20,
    width: "80%",
  },
  motivationText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 30,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalInner: {
    flex: 1,
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  modalCard: {
    backgroundColor: "transparent",
    width: "90%",
    padding: 20,
    borderRadius: 15,
  },
  modalHeading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
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
  modalDateSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF2D55",
  },
  modalDateSectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalDateSectionSubtitle: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  modalDatePickerButton: {
    backgroundColor: "#FF2D55",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  modalDatePickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalDatePickerSubText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  modalButtonContainer: {
    gap: 15,
  },
  modalUpdateButton: {
    backgroundColor: "#2D8CFF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  modalUpdateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalUpdateButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.6,
  },
  modalCancelButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
