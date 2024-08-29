// ScannerScreen.js
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { useUser } from "../../context/UserProvider";
import { SERVER_URI } from "@/utils/uri";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import styles from "@/styles/scanner/scanner"; // Import styles from the new file

export default function ScannerScreen() {
  const route = useRoute();
  const router = useRouter();
  const { imageUri } = route.params as { imageUri: string };
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanResult, setScanResult] = useState<{
    disease: string;
    confidence: number;
    prevention: string;
    metrics: any;
  } | null>(null);

  const scanImage = async () => {
    if (!user) {
      Alert.alert("Error", "User not found.");
      return;
    }

    try {
      setLoading(true);
      const fileName = `image_${Date.now()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: imageUri, to: newPath });

      const formData = new FormData();
      formData.append("image", {
        uri: newPath,
        name: fileName,
        type: "image/jpeg",
      } as any);

      const response = await axios.post(
        `${SERVER_URI}/upload_image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        const { disease, confidence, prevention, metrics } = response.data;
        setScanResult({ disease, confidence, prevention, metrics });
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      Alert.alert("Error", "Failed to scan image.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/(routes)/dashboard");
  };

  const handleViewResult = () => {
    if (scanResult) {
      setModalVisible(true);
    } else {
      Alert.alert("No Result", "Please scan an image first.");
    }
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#F8EDE3"]}
      style={{ flex: 1, paddingTop: 20 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>You want to change?</Text>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={scanImage}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={"white"} />
            ) : (
              <>
                <Ionicons name="scan" size={20} color="white" />
                <Text style={styles.buttonText}>Scan</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {scanResult && (
          <TouchableOpacity
            onPress={handleViewResult}
            style={styles.viewButton}
          >
            <Ionicons name="eye" size={20} color="white" />
            <Text style={styles.viewButtonText}>View Result</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scan Result</Text>
            {scanResult && (
              <>
                <Text style={styles.modalLabel}>
                  Disease: {scanResult.disease}
                </Text>
                <Text style={styles.modalLabel}>
                  Confidence: {(scanResult.confidence * 100).toFixed(2)}%
                </Text>
                <Text style={styles.modalLabel}>
                  Prevention: {scanResult.prevention}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
