import { View, Text, Image, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { useUser } from '../../context/UserProvider';
import { SERVER_URI } from '@/utils/uri';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScannerScreen() {
  const route = useRoute();
  const router = useRouter();
  const { imageUri } = route.params as { imageUri: string };
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const scanImage = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    try {
      setLoading(true);
      const fileName = `image_${Date.now()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: imageUri, to: newPath });

      const formData = new FormData();
      formData.append('image', {
        uri: newPath,
        name: fileName,
        type: 'image/jpeg',
      } as any);

      const response = await axios.post(`${SERVER_URI}/upload_image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        const { disease, confidence, prevention, metrics } = response.data;
        Alert.alert('Success', 'Image scanned successfully!');
        router.push({
          pathname: '/(routes)/result',
          params: { predictedImage: newPath, disease, confidence, prevention, metrics }
        });
      }
    } catch (error) {
      console.error('Error scanning image:', error);
      Alert.alert('Error', 'Failed to scan image.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/(routes)/dashboard');
  };

  return (
    <LinearGradient
      colors={['beige', 'rgba(0,0,0,0.22)']}
      style={{ flex: 1, paddingTop: 20 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Is this the image you want to scan?</Text>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={scanImage} style={styles.button} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={"white"} />
            ) : (
              <Text style={styles.buttonText}>Scan</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway_700Bold',
    color: '#2F3645',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    backgroundColor: 'yellowgreen',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Raleway_700Bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Raleway_700Bold',
  },
});
