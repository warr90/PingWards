import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GoalsContext } from "../../contexts/GoalsContexts";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import AppHeader from "../../components/AppHeader";

export default function Analytics() {
  const [currentUser, setCurrentUser] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalReminders: 0,
    completedReminders: 0,
    pendingReminders: 0,
    completionRate: 0,
    categoryStats: {},
    priorityStats: {},
    weeklyProgress: [],
    averageCompletionTime: 0,
  });

  const { reminders } = useContext(GoalsContext);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [reminders]);

  const calculateAnalytics = () => {
    const total = reminders.length;
    const completed = reminders.filter(r => r.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Category stats
    const categoryStats = {};
    reminders.forEach(reminder => {
      const category = reminder.category || 'General';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0 };
      }
      categoryStats[category].total++;
      if (reminder.completed) {
        categoryStats[category].completed++;
      }
    });

    // Priority stats
    const priorityStats = {};
    reminders.forEach(reminder => {
      const priority = reminder.priority || 'Medium';
      if (!priorityStats[priority]) {
        priorityStats[priority] = { total: 0, completed: 0 };
      }
      priorityStats[priority].total++;
      if (reminder.completed) {
        priorityStats[priority].completed++;
      }
    });

    // Weekly progress (last 7 days)
    const weeklyProgress = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayCompleted = reminders.filter(r =>
        r.completed &&
        r.completedAt &&
        new Date(r.completedAt).toISOString().split('T')[0] === dateString
      ).length;
      weeklyProgress.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayCompleted
      });
    }

    // Average completion time (in days)
    const completedWithTimes = reminders.filter(r => r.completed && r.completedAt && r.createdDate);
    const avgCompletionTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, r) => {
          const created = new Date(r.createdDate);
          const completed = new Date(r.completedAt);
          const diffTime = Math.abs(completed - created);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0) / completedWithTimes.length
      : 0;

    setAnalytics({
      totalReminders: total,
      completedReminders: completed,
      pendingReminders: pending,
      completionRate,
      categoryStats,
      priorityStats,
      weeklyProgress,
      averageCompletionTime: Math.round(avgCompletionTime * 10) / 10,
    });
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

  const getPriorityColor = (priority) => {
    const colors = {
      Low: '#4CAF50',
      Medium: '#FF9800',
      High: '#F44336'
    };
    return colors[priority] || colors.Medium;
  };

  return (
    <LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.container}>
      <AppHeader title="Analytics Dashboard" />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.totalReminders}</Text>
              <Text style={styles.statLabel}>Total Reminders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.completedReminders}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.pendingReminders}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.completionRate}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Weekly Progress</Text>
          <View style={styles.weeklyChart}>
            {analytics.weeklyProgress.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.max(day.completed * 20, 10) }
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{day.date}</Text>
                <Text style={styles.dayCount}>{day.completed}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📂 Category Performance</Text>
          {Object.entries(analytics.categoryStats).map(([category, stats]) => (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
                <Text style={styles.categoryName}>{category}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryStat}>
                  {stats.completed}/{stats.total} completed
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                        backgroundColor: getCategoryColor(category)
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Priority Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Priority Performance</Text>
          {Object.entries(analytics.priorityStats).map(([priority, stats]) => (
            <View key={priority} style={styles.priorityRow}>
              <Text style={[styles.priorityName, { color: getPriorityColor(priority) }]}>
                {priority}
              </Text>
              <View style={styles.priorityStats}>
                <Text style={styles.priorityStat}>
                  {stats.completed}/{stats.total} completed
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                        backgroundColor: getPriorityColor(priority)
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              Average completion time: {analytics.averageCompletionTime} days
            </Text>
          </View>
          {analytics.completionRate >= 80 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                🎉 Excellent! You're completing {analytics.completionRate}% of your reminders!
              </Text>
            </View>
          )}
          {analytics.completionRate < 50 && analytics.totalReminders > 5 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                💪 Let's work on completing more reminders. You've got this!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    height: 150,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 20,
    backgroundColor: '#FF2D55',
    borderRadius: 10,
    minHeight: 10,
  },
  dayLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  dayCount: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryStats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  categoryStat: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    width: 100,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  priorityName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 80,
  },
  priorityStats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priorityStat: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 5,
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  insightText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
});
