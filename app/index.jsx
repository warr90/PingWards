import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { auth } from "../firebaseConfig";

export default function Welcome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "PingWards - Login";
    }

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      setLoading(false);

      // Temporarily disable auto-redirect to show login/signup page
      // if (currentUser) {
      //   router.replace("/goals");
      // }
    });

    return unsubscribe;
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#2D8CFF", "#FF2D55"]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Show login/signup page regardless of auth state
  return (
    <LinearGradient
      colors={["#2D8CFF", "#FF2D55"]}
      style={styles.container}
    >
      {/* App Name */}
      <Text style={styles.appName}>
       𝐏𝐢𝐧𝐠𝐖𝐚𝐫𝐝𝐬
      </Text>

      {/* Tagline */}
      <Text style={styles.tagline}>
        "𝑆𝑚𝑎𝑟𝑡 𝑟𝑒𝑚𝑖𝑛𝑑𝑒𝑟𝑠. 𝑆𝑒𝑎𝑚𝑙𝑒𝑠𝑠 𝑠𝑢𝑝𝑝𝑜𝑟𝑡. 𝑇𝑖𝑚𝑒 𝑤𝑒𝑙𝑙 𝑠𝑝𝑒𝑛𝑡."
      </Text>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        style={styles.primaryButton}
      >
        <Text style={styles.buttonText}>LOG IN</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        onPress={handleSignup}
        style={styles.secondaryButton}
      >
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// Hide the header and title
export const options = {
  headerShown: false,
  title: "",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  appName: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    letterSpacing: 2,
  },
  tagline: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 50,
    fontSize: 20,
  },
  primaryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "60%",
    alignItems: "center",
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: "#9d4edd",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "60%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
