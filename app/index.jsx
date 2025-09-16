import { useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "";  
    }
  }, []);

  return (
    <LinearGradient
      colors={["#2E0249", "#570A57", "#A91079"]}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {/* App Name */}
      <Text
        style={{
          fontSize: 50,
          fontWeight: "bold",
          color: "#fff",
          marginBottom: 20,
          letterSpacing: 2,
        }}
      >
        CHATWARDS
      </Text>

      {/* Tagline */}
      <Text
        style={{
          color: "#ddd",
          textAlign: "center",
          marginBottom: 50,
          fontSize: 20,
        }}
      >
        𝒴𝑜𝓊𝓇 𝒫𝑒𝓇𝓈𝑜𝓃𝒶𝓁 𝑅𝑒𝓂𝒾𝓃𝒹𝑒𝓇 𝒜𝓅𝓅 – 𝒮𝓉𝒶𝓎 𝒪𝓇𝑔𝒶𝓃𝒾𝓏𝑒𝒹, 𝒩𝑒𝓋𝑒𝓇 𝑀𝒾𝓈𝓈 𝒶 𝒯𝒶𝓈𝓀.
      </Text>

      {/* Login Button */}
      <TouchableOpacity
        onPress={() => router.push("/login")}
        style={{
          backgroundColor: "#9333EA",
          paddingVertical: 10,
          borderRadius: 5,
          width: "60%",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          𝐋𝐨𝐠 𝐈𝐧
        </Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        onPress={() => router.push("/signup")}
        style={{
          borderColor: "#fff",
          borderWidth: 2,
          paddingVertical: 10,
          borderRadius: 5,
          width: "60%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          𝐒𝐢𝐠𝐧 𝐔𝐩
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// Hide the header and title
export const options = {
  headerShown: false,
  title: "",
};
