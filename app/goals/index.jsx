import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const tabs = ["Add Reminder", "View Reminders", "Daily Boost"];

const motivationalMessages = [
  "🚀 Keep pushing! Your goals are closer than you think!",
  "🔥 Stay focused. Your future self will thank you.",
  "🌟 Small steps every day lead to big results!",
  "💡 Reminders are your secret weapon to success.",
];

export default function ReminderTabs() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  const randomMotivation =
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <View style={{ flex: 1, backgroundColor: "#65007a" }}>
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

      {/* Content Area */}
      <View style={styles.content}>
        {selectedTab === "Add Reminder" && (
          <Text style={styles.contentText}>Add your reminder here!</Text>
        )}
        {selectedTab === "View Reminders" && (
          <Text style={styles.contentText}>View your saved reminders.</Text>
        )}
        {selectedTab === "Daily Boost" && (
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>{randomMotivation}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#3a0050",
    paddingVertical: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedTab: {
    backgroundColor: "#9b4dff",
  },
  tabText: {
    color: "#d3baff",
    fontWeight: "600",
  },
  selectedTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  contentText: {
    color: "#eee",
    fontSize: 20,
  },
  motivationContainer: {
    backgroundColor: "#aa6eff",
    borderRadius: 12,
    padding: 25,
  },
  motivationText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
});
