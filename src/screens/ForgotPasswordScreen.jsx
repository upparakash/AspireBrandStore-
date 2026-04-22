import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";
import Icon from "react-native-vector-icons/Ionicons";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    // Clear any previous alerts
    setLoading(true);

    // Validation
    if (!email) {
      Alert.alert("Error", "Email is required");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/customers/forgot-password`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          "Reset link sent to your email. Please check your inbox.",
          [
            { 
              text: "OK", 
              onPress: () => navigation.replace("Login") 
            }
          ]
        );
        setEmail(""); // Clear the email field
      } else {
        // Handle different error scenarios
        let errorMessage = data.message || "Unable to send reset link";
        
        if (response.status === 404) {
          errorMessage = "Email not found. Please check and try again.";
        } else if (response.status === 429) {
          errorMessage = "Too many attempts. Please try again later.";
        }
        
        Alert.alert(
  "Failed",
  errorMessage,
  [
    {
      text: "OK",
      onPress: () => {
        navigation.navigate("RegisterScreen"); 
      },
    },
  ]
);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      
      // Handle network errors
      if (!error.response && error.message === "Network request failed") {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="arrow-back-outline" size={24} color="#970c10" />
          </TouchableOpacity>

          <Text style={styles.title}>Forgot Password</Text>
          
          <Text style={styles.subtitle}>
            Enter your registered email address and we'll send you a link to reset your password.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              autoFocus
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity 
            onPress={() => navigation.navigate("Login")}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              ← Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#D5E2E6",
  },

  innerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  backButton: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#970c10",
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    lineHeight: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
  },

  inputIcon: {
    paddingLeft: 12,
  },

  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#333",
  },

  button: {
    backgroundColor: "#c1a37f",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#970c10",
    fontWeight: "bold",
    fontSize: 16,
  },

  loginLink: {
    alignItems: "center",
    marginTop: 20,
  },

  loginLinkText: {
    color: "#970c10",
    fontSize: 14,
    fontWeight: "500",
  },
});