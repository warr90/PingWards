import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useRouter } from "expo-router";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [locale, setLocale] = useState(Intl.DateTimeFormat().resolvedOptions().locale || "en-US");
  const router = useRouter();

 const handleSignup = async () => {
  try {
    console.log("Attempting signup with email:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Signup successful for user:", user.email);

    // Update profile with display name
    await updateProfile(user, { displayName: name });

    // Add user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      displayName: name,
      email: user.email,
      username: username,
      phoneNumber: phoneNumber,
      dateOfBirth: dateOfBirth,
      gender: gender,
      uid: user.uid,
      timezone: timezone,
      locale: locale,
      preferences: {
        theme: "light",
        notifications: true,
        defaultView: "list",
      },
      avatarUrl: "",
      createdAt: new Date(),
    });

    console.log("User data stored in Firestore, navigating to goals");
    Alert.alert("Signup Success", "Your account has been created!");
    router.replace("/goals");
  } catch (err) {
    console.error("Signup error:", err);
    Alert.alert("Signup Error", err.message);
  }
};



  return (
    <LinearGradient
      colors={["#2D8CFF", "#FF2D55"]}
      style={styles.container}
    >
      <Text style={styles.title}>𝐂𝐑𝐄𝐀𝐓𝐄 𝐀𝐂𝐎𝐔𝐍𝐓 </Text>
      <Text style={styles.subtitle}> 𝐉𝐎𝐈𝐍 𝐏𝐈𝐍𝐆𝐖𝐀𝐑𝐃𝐒𝐓𝐎𝐃𝐀𝐘! 🔗</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#ddd"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#ddd"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#ddd"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>SIGN UP </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    color: "#ddd",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    width: "60%",
    color: "#fff",
  },
  button: {
    backgroundColor: "#2D8CFF",
    padding: 14,
    borderRadius: 10,
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: "#fff",
    textDecorationLine: "underline",
  },
});
