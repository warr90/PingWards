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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { GoalsContext } from "../../contexts/GoalsContexts";

const tabs = ["View Reminders", "Daily Boost"];

const motivationalMessages = [
  "🚀 Keep pushing! Your goals are closer than you think!",
  "🔥 Stay focused. Your future self will thank you.",
  "🌟 Small steps every day lead to big results!",
  "💡 Reminders are your secret weapon to success.",
];

export default function ReminderTabs() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  const { reminders, deleteReminder, fetchReminders } = useContext(GoalsContext);
  const router = useRouter();

  const randomMotivation =
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  useEffect(() => {
    fetchReminders();
  }, []);

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
          <Text style={styles.heading}>My Reminders</Text>

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
                              {formatDate(new Date(item.createdDate))}
                            </Text>
                            <Text style={styles.creationDateSubtext}>
                              This is when you made this reminder
                            </Text>
                          </View>

                          {/* Reminder Date - prominent and highlighted */}
                          <View style={styles.reminderDateSection}>
                            <Text style={styles.reminderDateLabel}>🔔 REMIND ME:</Text>
                            <Text style={styles.reminderDateText}>
                              {formatDate(new Date(item.notificationDate))}
                            </Text>
                            <Text style={styles.reminderDateSubtext}>
                              This is when you'll get notified
                            </Text>
                          </View>
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

          {/* Daily Boost Tab */}
          {selectedTab === "Daily Boost" && (
            <View style={styles.motivationContainer}>
              <Text style={styles.motivationText}>{randomMotivation}</Text>
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
});
