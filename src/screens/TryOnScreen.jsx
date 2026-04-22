import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import { API_URL } from "@env";

export default function TryOnScreen({ route, navigation }) {
  const { product } = route.params;

  const [userImage, setUserImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
     IMAGE PICKER
  ================================ */

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      setUserImage(result.assets[0]);
      setGeneratedImage(null);
    }
  };

  /* ===============================
     GENERATE TRY ON
  ================================ */

  const handleGenerate = async () => {
    if (!userImage) {
      alert("Please upload your photo first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("userImage", {
        uri: userImage.uri,
        type: userImage.type,
        name: userImage.fileName || "user.jpg",
      });

      formData.append("productId", product.id);

      const response = await axios.post(
        `${API_URL}/api/try-on`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setGeneratedImage(response.data.imageUrl);
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Virtual Try On</Text>

        {/* PRODUCT NAME */}
        <Text style={styles.subtitle}>
          {product.subCategaryname}
        </Text>

        {/* SELECT IMAGE */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickImage}
        >
          <Text style={styles.uploadText}>
            Upload Your Photo
          </Text>
        </TouchableOpacity>

        {/* USER IMAGE PREVIEW */}
        {userImage && (
          <Image
            source={{ uri: userImage.uri }}
            style={styles.previewImage}
          />
        )}

        {/* GENERATE BUTTON */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateText}>
              Generate Try On ✨
            </Text>
          )}
        </TouchableOpacity>

        {/* RESULT IMAGE */}
        {generatedImage && (
          <>
            <Text style={styles.resultTitle}>
              Result
            </Text>
            <Image
              source={{ uri: generatedImage }}
              style={styles.previewImage}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===============================
   STYLES
================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D5E2E6",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#970c10",
  },

  uploadButton: {
    backgroundColor: "#c1a37f",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },

  uploadText: {
    fontWeight: "700",
    color: "#970c10",
  },

  generateButton: {
    backgroundColor: "#970c10",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },

  generateText: {
    color: "#fff",
    fontWeight: "700",
  },

  previewImage: {
    width: "100%",
    height: 350,
    borderRadius: 12,
    marginTop: 15,
  },

  resultTitle: {
    marginTop: 25,
    fontSize: 18,
    fontWeight: "700",
  },
});
