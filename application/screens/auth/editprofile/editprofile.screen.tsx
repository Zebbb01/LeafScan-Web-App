import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { useToast } from "react-native-toast-notifications";
import { useUser } from "../../../context/UserProvider";
import { router } from "expo-router";
import {
  useFonts,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { Ionicons } from "@expo/vector-icons";

const EditProfileScreen = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const { user, setUser } = useUser();
  const toast = useToast();

  const [fontsLoaded] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  useEffect(() => {
    if (user) {
      setUserInfo({ ...userInfo, name: user.name, email: user.email });
    }
  }, [user]);

  if (!fontsLoaded) return null;

  const handleValidation = (field: string, value: string) => {
    const errors: { [key: string]: string } = { ...error };
    if (field === "name" && !value.trim()) {
      errors.name = "Name cannot be empty";
    } else if (["currentPassword", "newPassword"].includes(field)) {
      if (value && !/(?=.*[0-9])/.test(value)) {
        errors[field] = "Password must contain at least one number";
      } else if (value && value.length < 8) {
        errors[field] = "Password must be at least 8 characters";
      } else {
        delete errors[field];
      }
    }
    setError(errors);
  };

  const handleUpdateProfile = async () => {
    if (!userInfo.name.trim()) {
      toast.show("Name cannot be empty", { type: "danger" });
      return;
    }

    if (userInfo.newPassword.trim() && !userInfo.currentPassword.trim()) {
      toast.show("Please enter your current password", { type: "danger" });
      return;
    }

    if (Object.keys(error).length) {
      toast.show("Please fix the errors before submitting.", { type: "danger" });
      return;
    }

    if (!user) {
      toast.show("User information is missing.", { type: "danger" });
      return;
    }

    setButtonSpinner(true);

    try {
      if (userInfo.currentPassword) {
        const passwordCheckResponse = await axios.post(
          `${SERVER_URI}/check-password`,
          { id: user.id, password: userInfo.currentPassword }
        );

        if (!passwordCheckResponse.data.valid) {
          setError({ currentPassword: "Current password is incorrect" });
          toast.show("Current password is incorrect", { type: "danger" });
          setButtonSpinner(false);
          return;
        }
      }

      const response = await axios.put(`${SERVER_URI}/update/${user.id}`, {
        name: userInfo.name,
        password: userInfo.newPassword.trim() ? userInfo.newPassword : undefined,
      });

      if (response.data.updated) {
        const updatedUser = { ...user, name: userInfo.name };
        setUser(updatedUser);
        router.push("/(routes)/dashboard");
        toast.show("Profile updated successfully", { type: "success" });
      } else {
        toast.show("Failed to update profile", { type: "danger" });
      }
    } catch (error) {
      console.error(error);
      toast.show("Failed to update profile", { type: "danger" });
    } finally {
      setButtonSpinner(false);
    }
  };

  const handleCancel = () => {
    router.push("/(routes)/dashboard");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={[styles.header, { fontFamily: "Raleway_700Bold" }]}>
          Edit Profile
        </Text>
        <TextInput
          style={styles.input}
          value={userInfo.name}
          placeholder="Enter Name"
          onChangeText={(text) => {
            setUserInfo({ ...userInfo, name: text });
            handleValidation("name", text);
          }}
        />
        {error.name && <Text style={styles.errorText}>{error.name}</Text>}
        <TextInput
          style={styles.input}
          value={userInfo.email}
          placeholder="Enter Email"
          editable={false}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!isCurrentPasswordVisible}
            value={userInfo.currentPassword}
            placeholder="Enter Current Password"
            onChangeText={(text) => {
              setUserInfo({ ...userInfo, currentPassword: text });
              handleValidation("currentPassword", text);
            }}
          />
          <TouchableOpacity
            style={styles.visibilityIcon}
            onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
          >
            <Ionicons
              name={isCurrentPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={"#747474"}
            />
          </TouchableOpacity>
        </View>
        {error.currentPassword && (
          <Text style={styles.errorText}>{error.currentPassword}</Text>
        )}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!isNewPasswordVisible}
            value={userInfo.newPassword}
            placeholder="Enter New Password"
            onChangeText={(text) => {
              setUserInfo({ ...userInfo, newPassword: text });
              handleValidation("newPassword", text);
            }}
          />
          <TouchableOpacity
            style={styles.visibilityIcon}
            onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
          >
            <Ionicons
              name={isNewPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={"#747474"}
            />
          </TouchableOpacity>
        </View>
        {error.newPassword && (
          <Text style={styles.errorText}>{error.newPassword}</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
          {buttonSpinner ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5", // Light background color
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: "#000", // Adding shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  header: {
    fontSize: 28,
    marginBottom: 20,
    color: "#333", // Darker color for better readability
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  visibilityIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  button: {
    backgroundColor: "yellowgreen",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#DC3545",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF0000",
    marginBottom: 10,
    fontSize: 14,
  },
});

export default EditProfileScreen;
