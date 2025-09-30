import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GoalsContext } from "../../contexts/GoalsContexts";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";

const SharedReminders = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sharedReminders, setSharedReminders] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");

  const { reminders, toggleReminderCompletion } = useContext(GoalsContext);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadSharedReminders();
    }
  }, [currentUser]);

  const loadSharedReminders = async () => {
    if (!currentUser) return;

    try {
      // Query for reminders shared with current user
      const sharedQuery = query(
        collection(db, "sharedReminders"),
        where("sharedWith", "array-contains", currentUser.email)
      );

      const unsubscribe = onSnapshot(sharedQuery, (snapshot) => {
        const shared = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          originalReminder: reminders.find(r => r.id === doc.data().reminderId)
        }));
        setSharedReminders(shared);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading shared reminders:", error);
    }
  };

  const shareReminder = async (reminderId, email) => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    if (email === currentUser.email) {
      Alert.alert("Error", "You cannot share with yourself");
      return;
    }

    try {
      // Check if user exists (simplified - in real app you'd verify user exists)
      const userExists = true; // Assume user exists for demo

      if (!userExists) {
        Alert.alert("Error", "User not found");
        return;
      }

      // Add to shared reminders collection
      await addDoc(collection(db, "sharedReminders"), {
        reminderId,
        sharedBy: currentUser.email,
        sharedWith: [email],
        sharedAt: new Date().toISOString(),
        canEdit: false, // Read-only for now
      });

      Alert.alert("Success", "Reminder shared successfully!");
      setShowShareModal(false);
      setUserEmail("");
      setSelectedReminder(null);
    } catch (error) {
      console.error("Error sharing reminder:", error);
      Alert.alert("Error", "Failed to share reminder");
    }
  };

  const addComment = async (sharedReminderId) => {
    if (!newComment.trim()) return;

    try {
      const commentData = {
        text: newComment.trim(),
        author: currentUser.email,
        createdAt: new Date().toISOString(),
        sharedReminderId,
      };

      await addDoc(collection(db, "comments"), commentData);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const loadComments = async (sharedReminderId) => {
    try {
      const commentsQuery = query(
        collection(db, "comments"),
        where("sharedReminderId", "==", sharedReminderId)
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const commentList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(prev => ({
          ...prev,
          [sharedReminderId]: commentList
        }));
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading comments:", error);
    }
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

  const renderSharedReminder = ({ item }) => {
    const reminder = item.originalReminder;
    if (!reminder) return null;

    const reminderComments = comments[item.id] || [];

    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <Text style={styles.sharedByText}>Shared by: {item.sharedBy}</Text>
          <Text style={styles.sharedDate}>
            {new Date(item.sharedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.reminderContent}>
          <Text style={styles.reminderText}>{reminder.text}</Text>
          <View style={styles.reminderMeta}>
            <Text style={styles.categoryText}>{reminder.category}</Text>
            <Text style={styles.priorityText}>{reminder.priority}</Text>
          </View>
        </View>

        <View style={styles.reminderActions}>
          <TouchableOpacity
            style={[styles.actionButton, reminder.completed && styles.completedButton]}
            onPress={() => toggleReminderCompletion(reminder.id)}
          >
            <Ionicons
              name={reminder.completed ? "checkmark-circle" : "radio-button-off"}
              size={20}
              color="#fff"
            />
            <Text style={styles.actionButtonText}>
              {reminder.completed ? "Completed" : "Mark Complete"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => loadComments(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.commentButtonText}>
              Comments ({reminderComments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {reminderComments.length > 0 && (
          <View style={styles.commentsSection}>
            <FlatList
              data={reminderComments}
              keyExtractor={(comment) => comment.id}
              renderItem={({ item: comment }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{comment.author}:</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        <View style={styles.addCommentSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#ccc"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={styles.addCommentButton}
            onPress={() => addComment(item.id)}
          >
            <Text style={styles.addCommentButtonText}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#2D8CFF", "#FF2D55"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Shared Reminders</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => Alert.alert("Profile", `Name: ${currentUser?.displayName || 'N/A'}\nEmail: ${currentUser?.email || 'N/A'}`)}
          >
            <Ionicons name="person-circle" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share Your Reminders</Text>
          <Text style={styles.sectionSubtitle}>
            Collaborate with friends and family on your goals
          </Text>

          <TouchableOpacity
            style={styles.sharePromptButton}
            onPress={() => router.push("/goals")}
          >
            <Text style={styles.sharePromptText}>
              📤 Go to My Reminders to Share
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sharedSection}>
          <Text style={styles.sectionTitle}>Reminders Shared With Me</Text>

          {sharedReminders.length > 0 ? (
            <FlatList
              data={sharedReminders}
              keyExtractor={(item) => item.id}
              renderItem={renderSharedReminder}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>🤝 No shared reminders yet</Text>
              <Text style={styles.emptySubtext}>
                Ask friends to share their reminders with you!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shareSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  sectionSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 15,
  },
  sharePromptButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sharePromptText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sharedSection: {
    flex: 1,
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF2D55',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sharedByText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sharedDate: {
    color: '#ccc',
    fontSize: 12,
  },
  reminderContent: {
    marginBottom: 15,
  },
  reminderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  reminderMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D8CFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentsSection: {
    marginBottom: 15,
    maxHeight: 150,
  },
  commentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  commentDate: {
    color: '#999',
    fontSize: 12,
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    minHeight: 40,
  },
  addCommentButton: {
    backgroundColor: '#FF2D55',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCommentButtonText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SharedReminders;
