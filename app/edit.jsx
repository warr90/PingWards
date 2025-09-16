import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useRouter, useSearchParams } from "expo-router";

export default function EditNote() {
  const { id, title: oldTitle, content: oldContent } = useSearchParams();
  const [title, setTitle] = useState(oldTitle);
  const [content, setContent] = useState(oldContent);
  const router = useRouter();

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "notes", id), { title, content });
      router.back();
    } catch (err) {
      Alert.alert("Update error", err.message);
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
      <Button title="Update" onPress={handleUpdate} />
    </View>
  );
}
