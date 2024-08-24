import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  AntDesign,
  Entypo,
  Fontisto,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Raleway_700Bold,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { commonStyles } from "@/styles/common/common.styles";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import { useUser } from "../../../context/UserProvider";

export default function SignUpScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    password: "",
    email: "",
  });
  const { setUser } = useUser();

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handlePasswordValidation = (value: string) => {
    const password = value;
    const passwordOneNumber = /(?=.*[0-9])/;
    const passwordSixValue = /(?=.{8,})/;

    if (!passwordSixValue.test(password)) {
      setError((prevError) => ({
        ...prevError,
        password: "Write at least 8 characters",
      }));
    } else if (!passwordOneNumber.test(password)) {
      setError((prevError) => ({
        ...prevError,
        password: "Write at least one number",
      }));
    } else {
      setError((prevError) => ({ ...prevError, password: "" }));
    }
    setUserInfo((prevInfo) => ({ ...prevInfo, password: value }));
  };

  const handleEmailValidation = (value: string) => {
    const email = value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError((prevError) => ({
        ...prevError,
        email: "Invalid email address",
      }));
    } else {
      setError((prevError) => ({ ...prevError, email: "" }));
    }
    setUserInfo((prevInfo) => ({ ...prevInfo, email: value }));
  };

  const handleSignIn = () => {
    if (!userInfo.password) {
      Toast.show("Password cannot be empty!", { type: "danger" });
      return;
    }
  
    if (!userInfo.email) {
      Toast.show("Email cannot be empty!", { type: "danger" });
      return;
    }
  
    if (error.password || error.email) {
      Toast.show("Please fix the errors before submitting.", { type: "danger" });
      return;
    }
  
    setButtonSpinner(true);
    axios
      .post(`${SERVER_URI}/create_token`, {
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password,
      })
      .then((res) => {
        const userData = res.data; // Adjust according to the response format
        setUser(userData);
        Toast.show(res.data.message || "Register successfully. Please verify your account.", {
          type: "success",
        });
        setUserInfo({ name: "", email: "", password: "" });
        setButtonSpinner(false);
        router.push({
          pathname: "/(routes)/verifyAccount",
          params: { userId: res.data.id, email: userInfo.email }, // Pass email as well
        });
      })
      .catch((error) => {
        setButtonSpinner(false);
        if (axios.isAxiosError(error)) {
          if (error.response?.data?.error === "Email already exists") {
            Toast.show("Email already exists", { type: "danger" });
          } else {
            // Other errors are logged but not shown as toast notifications
            console.error("Error during sign-up:", error);
          }
        } else {
          // Handle unexpected errors
          console.error("Unexpected error during sign-up:", error);
        }
      });
  };
  

  return (
    <LinearGradient
      colors={["beige", "rgba(0,0,0,0.22)"]}
      style={{ flex: 1, paddingTop: 20 }}
    >
      <ScrollView>
        <Image
          style={styles.signInImage}
          source={require("@/assets/sign-in/sign-up.png")}
        />
        <Text style={[styles.welcomeText, { fontFamily: "Raleway_700Bold" }]}>
          Let's get started!
        </Text>
        <Text style={styles.learningText}>
          Create an account to LeafScan to get all features
        </Text>
        <View style={styles.inputContainer}>
          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40, marginBottom: -12 }]}
              keyboardType="default"
              value={userInfo.name}
              placeholder="john doe"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, name: value })
              }
            />
            <AntDesign
              style={{ position: "absolute", left: 26, top: 14 }}
              name="user"
              size={20}
              color={"#A1A1A1"}
            />
          </View>
          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40 }]}
              keyboardType="email-address"
              value={userInfo.email}
              placeholder="support@LeafScan.com"
              onChangeText={handleEmailValidation}
            />
            <Fontisto
              style={{ position: "absolute", left: 26, top: 17.8 }}
              name="email"
              size={20}
              color={"#A1A1A1"}
            />
            {error.email && (
              <View style={commonStyles.errorContainer}>
                <Entypo name="cross" size={18} color={"red"} />
                <Text style={{ color: "red", fontSize: 11, marginTop: -1 }}>
                  {error.email}
                </Text>
              </View>
            )}
            <View style={{ marginBottom: 15 }}>
              <TextInput
                style={commonStyles.input}
                keyboardType="default"
                secureTextEntry={!isPasswordVisible}
                value={userInfo.password}
                placeholder="********"
                onChangeText={handlePasswordValidation}
              />
              <TouchableOpacity
                style={styles.visibleIcon}
                onPress={() => setPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <Ionicons
                    name="eye-off-outline"
                    size={23}
                    color={"#747474"}
                  />
                ) : (
                  <Ionicons name="eye-outline" size={23} color={"#747474"} />
                )}
              </TouchableOpacity>
              <SimpleLineIcons
                style={styles.icon2}
                name="lock"
                size={20}
                color={"#A1A1A1"}
              />
            </View>
            {error.password && (
              <View style={[commonStyles.errorContainer, { top: 145 }]}>
                <Entypo name="cross" size={18} color={"red"} />
                <Text style={{ color: "red", fontSize: 11, marginTop: -1 }}>
                  {error.password}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={{
                padding: 16,
                borderRadius: 8,
                marginHorizontal: 16,
                backgroundColor: "yellowgreen",
                marginTop: 15,
              }}
              onPress={handleSignIn}
            >
              {buttonSpinner ? (
                <ActivityIndicator size="small" color={"white"} />
              ) : (
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 16,
                    fontFamily: "Raleway_700Bold",
                  }}
                >
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
            <View style={styles.signupRedirect}>
              <Text style={{ fontSize: 18, fontFamily: "Raleway_600SemiBold" }}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(routes)/login")}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Raleway_600SemiBold",
                    color: "#016A70",
                    marginLeft: 5,
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  signInImage: {
    width: "30%",
    height: 130,
    alignSelf: "center",
    marginTop: 100,
  },
  welcomeText: {
    textAlign: "center",
    fontSize: 24,
  },
  learningText: {
    textAlign: "center",
    color: "#575757",
    fontSize: 15,
    marginTop: 5,
  },
  inputContainer: {
    marginHorizontal: 16,
    marginTop: 30,
    rowGap: 30,
  },
  input: {
    height: 55,
    marginHorizontal: 16,
    borderRadius: 8,
    paddingLeft: 35,
    fontSize: 16,
    backgroundColor: "white",
    color: "#A1A1A1",
    marginBottom: 25,
  },
  visibleIcon: {
    position: "absolute",
    right: 30,
    top: 15,
  },
  icon2: {
    position: "absolute",
    left: 23,
    top: 17.8,
    marginTop: -2,
  },
  signupRedirect: {
    flexDirection: "row",
    marginHorizontal: 16,
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 20,
  },
});
