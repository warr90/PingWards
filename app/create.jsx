import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";  
import { useRouter } from "expo-router";

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    try {
      await addDoc(collection(db, "notes"), {
        title,
        content,
        createdAt: serverTimestamp(),
      });
      router.back();
    } catch (err) {
      Alert.alert("Create error", err.message);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
        style={{ height: 120 }}
      />
      <Button title="Create" onPress={handleCreate} />
    </View>
  );
}
