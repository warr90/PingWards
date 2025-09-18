import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from "expo-linear-gradient";

export default function CreateGoal() {
  const [goal, setGoal] = useState("");
  const [goalsList, setGoalsList] = useState([]);
  const [activeTab, setActiveTab] = useState("add");
  const [notificationDate, setNotificationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddGoal = () => {
    if (!goal.trim()) {
      Alert.alert("Validation", "Please enter a reminder.");
      return;
    }

    const newGoal = {
      text: goal.trim(),
      createdDate: new Date(),
      notificationDate,
      id: Date.now().toString(), 
    };

    setGoalsList((currentGoals) => [...currentGoals, newGoal]);
    setGoal("");
    setActiveTab("view");
  };


  const deleteReminder = (id) => {
    setGoalsList((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== id)
    );
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false); 
    if (selectedDate) {
      setNotificationDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Create a Reminder</Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "add" && styles.activeTab]}
              onPress={() => setActiveTab("add")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "add" && styles.activeTabText,
                ]}
              >
                Add Reminder
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "view" && styles.activeTab]}
              onPress={() => setActiveTab("view")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "view" && styles.activeTabText,
                ]}
              >
                View Reminders
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Reminder */}
          {activeTab === "add" && (
            <>
              <TextInput
                placeholder="What to remind you?"
                placeholderTextColor="#ccc"
                style={styles.input}
                value={goal}
                onChangeText={setGoal}
                returnKeyType="done"
                onSubmitEditing={handleAddGoal}
              />

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  📅 Notification Date:
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={notificationDate}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                />
              )}

              <TouchableOpacity style={styles.button} onPress={handleAddGoal}>
                <Text style={styles.buttonText}>Add New Reminder</Text>
              </TouchableOpacity>
            </>
          )}

          {/* View Reminders */}
          {activeTab === "view" && (
            <View style={styles.listContainer}>
              {goalsList.length === 0 ? (
                <Text style={styles.noReminders}>No reminders yet.</Text>
              ) : (
                <>
                  <Text style={styles.listHeading}>Your Reminders:</Text>
                  <FlatList
                    data={goalsList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.listItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listItemText}>{item.text}</Text>
                          <Text style={styles.dateText}>
                            Created: {formatDate(new Date(item.createdDate))}
                          </Text>
                          <Text style={styles.dateText}>
                            Notify on: {formatDate(new Date(item.notificationDate))}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteReminder(item.id)}
                          accessibilityLabel={`Delete reminder: ${item.text}`}
                        >
                          <Text style={styles.deleteButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </>
              )}
            </View>
          )}
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
    marginBottom: 30,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#1E5F99",
    borderRadius: 10,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#1E5F99",
  },
  activeTab: {
    backgroundColor: "#FF2D55",
  },
  tabText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
  },
  datePickerButton: {
    backgroundColor: "#8e44ad",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  datePickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#9d4edd",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  listContainer: {
    marginTop: 10,
  },
  listHeading: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 15,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#4A90E2",
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
  dateText: {
    color: "#d1c4e9",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
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
  noReminders: {
    color: "#ccc",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
});
