import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GoalsContext } from "../../contexts/GoalsContexts";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import AppHeader from "../../components/AppHeader";

const moodQuotes = {
  motivated: [
    "🚀 Your potential is limitless. Keep pushing forward!",
    "💪 Every expert was once a beginner. You're on the right path!",
    "🌟 Success is not final, failure is not fatal. Keep going!",
  ],
  focused: [
    "🎯 Focus on progress, not perfection. Small steps matter!",
    "🧠 Your mind is your most powerful tool. Use it wisely!",
    "⚡ One focused hour is worth three unfocused ones.",
  ],
  relaxed: [
    "😌 Take a deep breath. You've got this one step at a time!",
    "🌸 Progress over perfection. Celebrate your small wins!",
    "🕊️ Sometimes the best action is mindful inaction.",
  ],
  stressed: [
    "🧘‍♀️ Remember: This too shall pass. Take it one moment at a time.",
    "🌈 After the storm comes the rainbow. You're stronger than you know!",
    "💚 Self-care isn't selfish. It's necessary for growth.",
  ],
};

const smartSuggestions = [
  {
    title: "Break it Down",
    description: "Large goals feel overwhelming. Break them into smaller, actionable steps.",
    icon: "📝",
  },
  {
    title: "Set Time Blocks",
    description: "Schedule specific times for your reminders to build consistent habits.",
    icon: "⏰",
  },
  {
    title: "Track Progress",
    description: "Use the analytics tab to see your completion patterns and celebrate wins!",
    icon: "📊",
  },
  {
    title: "Review Weekly",
    description: "Set aside time each week to review completed tasks and plan ahead.",
    icon: "📅",
  },
  {
    title: "Stay Accountable",
    description: "Share your goals with a friend or use the app's tracking features.",
    icon: "🤝",
  },
  {
    title: "Reward Yourself",
    description: "Celebrate completions with small rewards to maintain motivation.",
    icon: "🎉",
  },
];

export default function AIInsights() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentQuote, setCurrentQuote] = useState("");
  const [insights, setInsights] = useState([]);

  const { reminders } = useContext(GoalsContext);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    generateInsights();
  }, [reminders]);

  const generateInsights = () => {
    const total = reminders.length;
    const completed = reminders.filter(r => r.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const insights = [];

    // Completion rate insights
    if (completionRate >= 80) {
      insights.push({
        type: "success",
        title: "High Achiever! 🎉",
        message: `You're completing ${completionRate}% of your reminders. Keep up the excellent work!`,
        icon: "🏆",
      });
    } else if (completionRate >= 50) {
      insights.push({
        type: "info",
        title: "Steady Progress 📈",
        message: `You're completing ${completionRate}% of your reminders. You're on the right track!`,
        icon: "📊",
      });
    } else if (total > 0) {
      insights.push({
        type: "warning",
        title: "Room for Growth 🌱",
        message: `You're completing ${completionRate}% of your reminders. Let's work on building better habits!`,
        icon: "🌱",
      });
    }

    // Category insights
    const categories = {};
    reminders.forEach(r => {
      const cat = r.category || 'General';
      if (!categories[cat]) categories[cat] = { total: 0, completed: 0 };
      categories[cat].total++;
      if (r.completed) categories[cat].completed++;
    });

    const strugglingCategories = Object.entries(categories)
      .filter(([_, stats]) => stats.total >= 2 && (stats.completed / stats.total) < 0.5)
      .map(([cat, _]) => cat);

    if (strugglingCategories.length > 0) {
      insights.push({
        type: "suggestion",
        title: "Focus Areas 🎯",
        message: `Consider spending more time on ${strugglingCategories.join(', ')} reminders.`,
        icon: "🎯",
      });
    }

    // Time-based insights
    const recentReminders = reminders.filter(r => {
      const created = new Date(r.createdDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    });

    if (recentReminders.length === 0 && total > 0) {
      insights.push({
        type: "suggestion",
        title: "Time to Create! ✨",
        message: "It's been a while since you added new reminders. What goals are you working toward?",
        icon: "✨",
      });
    }

    // Priority insights
    const highPriority = reminders.filter(r => r.priority === 'High');
    const completedHigh = highPriority.filter(r => r.completed).length;

    if (highPriority.length > 0 && completedHigh === 0) {
      insights.push({
        type: "warning",
        title: "High Priority Focus ⚡",
        message: "You have high-priority reminders that haven't been completed yet.",
        icon: "⚡",
      });
    }

    setInsights(insights);
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    const quotes = moodQuotes[mood];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
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

  const getInsightColor = (type) => {
    switch (type) {
      case "success": return "#4CAF50";
      case "warning": return "#FF9800";
      case "info": return "#2196F3";
      case "suggestion": return "#9C27B0";
      default: return "#666";
    }
  };

  return (
    <LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.container}>
      <AppHeader title="AI Insights" />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Mood Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today? 😊</Text>
          <View style={styles.moodContainer}>
            {Object.keys(moodQuotes).map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodButton,
                  selectedMood === mood && styles.moodButtonSelected
                ]}
                onPress={() => handleMoodSelect(mood)}
              >
                <Text style={styles.moodEmoji}>
                  {mood === 'motivated' ? '🚀' :
                   mood === 'focused' ? '🎯' :
                   mood === 'relaxed' ? '😌' : '🧘‍♀️'}
                </Text>
                <Text style={[
                  styles.moodText,
                  selectedMood === mood && styles.moodTextSelected
                ]}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentQuote && (
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"{currentQuote}"</Text>
            </View>
          )}
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Smart Insights</Text>
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <View key={index} style={[styles.insightCard, { borderLeftColor: getInsightColor(insight.type) }]}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyInsights}>
              <Text style={styles.emptyText}>Complete some reminders to get personalized insights! 📊</Text>
            </View>
          )}
        </View>

        {/* Smart Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Productivity Tips</Text>
          <View style={styles.suggestionsGrid}>
            {smartSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionCard}>
                <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
              </View>
            ))}
          </View>
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
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '22%',
  },
  moodButtonSelected: {
    backgroundColor: '#FF2D55',
    borderWidth: 2,
    borderColor: '#fff',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodTextSelected: {
    color: '#fff',
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF2D55',
  },
  quoteText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  insightMessage: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyInsights: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  suggestionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  suggestionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  suggestionDescription: {
    color: '#ccc',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
