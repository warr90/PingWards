import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      console.log("Attempting login with email:", email);
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
      }
      if (!password) {
        alert("Please enter your password.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Login successful for user:", user.email);

      // Store or update user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        uid: user.uid,
        lastLogin: new Date(),
      }, { merge: true });

      console.log("User data stored in Firestore, navigating to goals");
      router.push("/goals");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login error: " + err.message);
    }
  };



  return (
    <LinearGradient
      colors={["#2D8CFF", "#FF2D55"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
    >
      {/* App Branding */}
      <View style={{ alignItems: "center", marginBottom: 50 }}>
        {/* App Name and Icon Row */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 15 }}>
          {/* Reminder Icon */}
          <Text style={{
            fontSize: 24,
            color: "#FFD700",
            marginRight: 6,
            textShadowColor: '#FF6B35',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
            textAlign: "center",
          }}>
            🔔
          </Text>

          {/* App Name with Enhanced Styling */}
          <Text style={{
            fontSize: 44,
            color: "#FFF",
            fontWeight: "900",
            textAlign: "center",
            textShadowColor: '#4A90E2',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 15,
            letterSpacing: 2,
          }}>
            𝐏𝐢𝐧𝐠𝐖𝐚𝐫𝐝𝐬
          </Text>
        </View>

        {/* Tagline with Enhanced Styling */}
        <Text style={{
          fontSize: 16,
          color: "#fff",
          textAlign: "center",
          fontStyle: "italic",
          opacity: 0.95,
          lineHeight: 24,
          fontWeight: "500",
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 5,
        }}>
          "𝑆𝑚𝑎𝑟𝑡 𝑟𝑒𝑚𝑖𝑛𝑑𝑒𝑟𝑠. 𝑆𝑒𝑎𝑚𝑙𝑒𝑠𝑠 𝑠𝑢𝑝𝑝𝑜𝑟𝑡. 𝑇𝑖𝑚𝑒 𝑤𝑒𝑙𝑙 𝑠𝑝𝑒𝑛𝑡."
        </Text>
      </View>

      <Text style={{ fontSize: 28, color: "#fff", fontWeight: "bold", marginBottom: 30 }}>
        𝐋𝐎𝐆 𝐈𝐍
      </Text>

      <TextInput
        placeholder="Phone number/email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        style={{
          width: "60%",
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "#fff",
          padding: 12,
          borderRadius: 10,
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          width: "60%",
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "#fff",
          padding: 12,
          borderRadius: 10,
          marginBottom: 20,
        }}
      />

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        style={{
          width: "30%",
          backgroundColor: "#2D8CFF",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>LOG IN</Text>
      </TouchableOpacity>

      {/* Sign up Link */}
      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={{ color: "#fff" }}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
