import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from '@expo-google-fonts/nunito';
import { Toast } from 'react-native-toast-notifications';
import axios from 'axios';
import { SERVER_URI } from '@/utils/uri';
import { router } from 'expo-router';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  let [fontsLoaded, fontError] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_400Regular,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleSubmit = () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (error) {
      Toast.show('Please fix the errors before submitting.', { type: 'danger' });
      return;
    }

    axios.post(`${SERVER_URI}/forgot_password`, { email })
      .then(() => {
        Toast.show('A new password has been sent to your email.', { type: 'success' });
        setEmail('');
      })
      .catch(error => {
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          Toast.show(error.response.data.error, { type: 'danger' });
        } else {
          Toast.show('An error occurred. Please try again.', { type: 'danger' });
        }
        console.error('Error during password reset:', error);
      });
  };

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={styles.container}>
      <Text style={[styles.headerText, { fontFamily: "Nunito_600SemiBold" }]}>
        Reset Email Password
      </Text>
      <TextInput
        style={[styles.input, { fontFamily: "Nunito_400Regular" }]}
        placeholder="Username@gmail.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={[styles.buttonText, { fontFamily: "Nunito_600SemiBold" }]}>
          Send
        </Text>
      </TouchableOpacity>
      <View style={styles.loginLink}>
        <Text style={[styles.backText, { fontFamily: "Nunito_700Bold" }]}>
          Back To?
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.loginText, { fontFamily: "Nunito_700Bold" }]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3876EE",
    width: "100%",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  loginLink: {
    flexDirection: "row",
    marginTop: 30,
  },
  loginText: {
    color: "#3876EE",
    marginLeft: 5,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },

  backText: { fontSize: 16 },
});
