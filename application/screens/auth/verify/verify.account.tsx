import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import Button from "@/components/button/button";
import axios from 'axios';
import { SERVER_URI } from '@/utils/uri';
import { Toast } from 'react-native-toast-notifications';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function VerifyAccountScreen() {
  const router = useRouter();
  const { userId, email } = useLocalSearchParams();
  const [code, setCode] = useState(new Array(4).fill(''));
  const inputs = useRef(code.map(() => React.createRef<TextInput>()));

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.toUpperCase(); // Transform input to uppercase
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.current?.focus();
    }

    if (text === "" && index > 0) {
      inputs.current[index - 1]?.current?.focus();
    }
  };

  const handleSubmit = () => {
    const verificationCode = code.join('');
    axios.post(`${SERVER_URI}/verify_account`, {
      email: email,
      code: verificationCode,
    })
    .then(res => {
      Toast.show('Account verified successfully. Use your account to Sign In.', { type: 'success' });
      router.push('/(routes)/login');
    })
    .catch(error => {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        Toast.show(error.response.data.error, { type: 'danger' });
      } else {
        Toast.show('Invalid verification code. Please try again.', { type: 'danger' });
      }
      console.error('Error during verification:', error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Verification Code</Text>
      <Text style={styles.subText}>
        We have sent a verification code to your email. Please enter the code below.
      </Text>
      <View style={styles.inputContainer}>
        {code.map((_, index) => (
          <TextInput
            key={index}
            style={styles.inputBox}
            maxLength={1}
            onChangeText={(text) => handleInput(text, index)}
            value={code[index]}
            ref={inputs.current[index]}
            autoFocus={index === 0}
          />
        ))}
      </View>
      <View style={{ marginTop: 15 }}>
        <Button title="Submit" onPress={handleSubmit} style={{ backgroundColor: 'yellowgreen' }}/>
      </View>
      <View style={styles.loginLink}>
        <Text style={[styles.backText, { fontFamily: "Nunito_700Bold" }]}>
          Back To?
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.loginText, { fontFamily: "Nunito_700Bold" }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  inputBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
    marginRight: 10,
    borderRadius: 10,
    fontSize: 20,
    textTransform: "uppercase", // Ensure text appears in uppercase
  },
  loginLink: {
    flexDirection: "row",
    marginTop: 30,
  },
  loginText: {
    color: "#016A70",
    marginLeft: 5,
    fontSize: 16,
  },
  backText: { fontSize: 16 },
});
