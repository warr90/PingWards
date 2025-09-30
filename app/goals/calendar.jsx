import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GoalsContext } from "../../contexts/GoalsContexts";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import AppHeader from "../../components/AppHeader";

// Configure calendar locale
LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today'
};
LocaleConfig.defaultLocale = 'en';

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentUser, setCurrentUser] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  const { reminders, updateReminder } = useContext(GoalsContext);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Mark dates with reminders
    const marked = {};
    reminders.forEach(reminder => {
      const date = new Date(reminder.notificationDate).toISOString().split('T')[0];
      if (marked[date]) {
        marked[date].dots.push({ color: getPriorityColor(reminder.priority) });
      } else {
        marked[date] = {
          marked: true,
          dots: [{ color: getPriorityColor(reminder.priority) }],
        };
      }
    });

    // Mark selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = '#FF2D55';
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#FF2D55',
      };
    }

    setMarkedDates(marked);
  }, [reminders, selectedDate]);

  const getPriorityColor = (priority) => {
    const colors = {
      Low: '#4CAF50',
      Medium: '#FF9800',
      High: '#F44336'
    };
    return colors[priority] || colors.Medium;
  };

  const getRemindersForDate = (dateString) => {
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.notificationDate).toISOString().split('T')[0];
      return reminderDate === dateString;
    });
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleReminderPress = (reminder) => {
    Alert.alert(
      reminder.text,
      `Category: ${reminder.category || 'General'}\nPriority: ${reminder.priority || 'Medium'}\nTags: ${reminder.tags?.join(', ') || 'None'}`,
      [
        { text: 'Edit', onPress: () => router.push(`/goals/edit?id=${reminder.id}`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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

  const selectedDateReminders = getRemindersForDate(selectedDate);

  return (
    <LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.container}>
      <AppHeader title="Calendar View" />

      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'rgba(255, 255, 255, 0.1)',
          textSectionTitleColor: '#fff',
          selectedDayBackgroundColor: '#FF2D55',
          selectedDayTextColor: '#fff',
          todayTextColor: '#FF2D55',
          dayTextColor: '#fff',
          textDisabledColor: 'rgba(255, 255, 255, 0.3)',
          dotColor: '#FF2D55',
          selectedDotColor: '#fff',
          arrowColor: '#fff',
          monthTextColor: '#fff',
          indicatorColor: '#fff',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        markingType={'multi-dot'}
      />

      <View style={styles.selectedDateSection}>
        <Text style={styles.selectedDateTitle}>
          Reminders for {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        {selectedDateReminders.length === 0 ? (
          <Text style={styles.noReminders}>No reminders for this date</Text>
        ) : (
          <ScrollView style={styles.remindersList}>
            {selectedDateReminders.map((reminder) => (
              <TouchableOpacity
                key={reminder.id}
                style={styles.reminderItem}
                onPress={() => handleReminderPress(reminder)}
              >
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderText}>{reminder.text}</Text>
                  <View style={styles.reminderMeta}>
                    <Text style={[styles.reminderCategory, { color: getCategoryColor(reminder.category) }]}>
                      {reminder.category || 'General'}
                    </Text>
                    <Text style={[styles.reminderPriority, { color: getPriorityColor(reminder.priority) }]}>
                      {reminder.priority || 'Medium'}
                    </Text>
                  </View>
                  {reminder.tags && reminder.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {reminder.tags.map((tag, index) => (
                        <Text key={index} style={styles.tag}>#{tag}</Text>
                      ))}
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
}

const getCategoryColor = (category) => {
  const colors = {
    General: '#4A90E2',
    Work: '#FF6B35',
    Personal: '#9D4EDD',
    Health: '#06FFA5',
    Education: '#FFD23F'
  };
  return colors[category] || colors.General;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  calendar: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedDateSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  noReminders: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  remindersList: {
    flex: 1,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reminderContent: {
    flex: 1,
  },
  reminderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reminderCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 15,
  },
  reminderPriority: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    marginBottom: 2,
  },
});
