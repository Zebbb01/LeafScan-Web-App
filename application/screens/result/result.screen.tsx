import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function ResultScreen() {
  const route = useRoute<RouteProp<{
    ResultScreen: {
      predictedImage: string;
      disease: string;
      confidence: number;
      prevention: string;
      metrics?: {
        accuracy?: number;
        precision?: number;
        recall?: number;
        f1_score?: number;
      };
    };
  }, 'ResultScreen'>>();

  const router = useRouter();
  const { predictedImage, disease, confidence, prevention, metrics } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  const formattedConfidence = (confidence * 100).toFixed(2);

  const handleCancel = () => {
    router.push('/(routes)/dashboard');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Scan Result</Text>
      {predictedImage && (
        <Image source={{ uri: predictedImage }} style={styles.image} resizeMode="contain" />
      )}
      <Text style={styles.label}>Disease:</Text>
      <Text style={styles.value}>{disease}</Text>
      <Text style={styles.label}>Confidence:</Text>
      <Text style={styles.value}>{formattedConfidence}%</Text>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button1} onPress={handleCancel}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Details</Text>
            <Text style={styles.modalLabel}>Prevention:</Text>
            <Text style={styles.modalValue}>{prevention}</Text>
            <Text style={styles.modalLabel}>Performance Metrics:</Text>
            <Text style={styles.modalValue}>Accuracy: {metrics?.accuracy}</Text>
            <Text style={styles.modalValue}>Precision: {metrics?.precision}</Text>
            <Text style={styles.modalValue}>Recall: {metrics?.recall}</Text>
            <Text style={styles.modalValue}>F1 Score: {metrics?.f1_score}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'beige',
    flexGrow: 1,
  },
  title: {
    marginTop: 100,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2F3645',
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F3645',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: '#4A4A4A',
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'yellowgreen',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  button1: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalValue: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
