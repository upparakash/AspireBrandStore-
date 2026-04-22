import React, { useState, useCallback } from "react";
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
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";
import Aspirelogo from "../images/AspireBrandBag.png";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  // All hooks must be called at the top level, unconditionally
  const navigation = useNavigation();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Memoize the validation function to prevent unnecessary re-renders
  const isNumber = useCallback((value) => /^\d+$/.test(value), []);

  const handleLogin = useCallback(async () => {
    // Trim inputs before validation
    const trimmedEmailOrPhone = emailOrPhone?.trim() || "";
    const trimmedPassword = password?.trim() || "";

    if (!trimmedEmailOrPhone || !trimmedPassword) {
      Alert.alert("error","Please fill all fields");
      return;
    }

    const isPhone = isNumber(trimmedEmailOrPhone);
    const payload = isPhone
      ? { number: trimmedEmailOrPhone, password: trimmedPassword }
      : { email: trimmedEmailOrPhone.toLowerCase(), password: trimmedPassword };

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        Alert.alert("Success", "Login successful", [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
              });
            },
          },
        ]);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [emailOrPhone, password, isNumber, navigation]);

  // Memoize navigation handlers
  const handleForgotPassword = useCallback(() => {
    navigation.navigate("ForgotPasswordScreen");
  }, [navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate("RegisterScreen");
  }, [navigation]);

  const handlePrivacyPolicy = useCallback(() => {
    navigation.navigate("PrivacyPolicy");
  }, [navigation]);

  const handleTermsConditions = useCallback(() => {
    navigation.navigate("TermsConditions");
  }, [navigation]);

  const handleReturnRefund = useCallback(() => {
    navigation.navigate("ReturnRefundPolicy");
  }, [navigation]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image source={Aspirelogo} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Icon name="mail-outline" size={20} color="#970c10" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email ID"
                placeholderTextColor="#999"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="off"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Icon name="lock-closed-outline" size={20} color="#970c10" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeIcon}
                disabled={loading}
              >
                <Icon
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#970c10"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legalContainer}>
            <TouchableOpacity onPress={handlePrivacyPolicy} disabled={loading}>
              <Text style={styles.legalText}>Privacy Policy</Text>
            </TouchableOpacity>

            <Text style={styles.legalDivider}>•</Text>

            <TouchableOpacity onPress={handleTermsConditions} disabled={loading}>
              <Text style={styles.legalText}>Terms & Conditions</Text>
            </TouchableOpacity>

            <Text style={styles.legalDivider}>•</Text>

            <TouchableOpacity onPress={handleReturnRefund} disabled={loading}>
              <Text style={styles.legalText}>Return & Refund</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#D5E2E6",
  },
  screen: {
    flex: 1,
    backgroundColor: "#D5E2E6",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#970c10",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
  },
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: 4,
  },
  forgotPassword: {
    color: "#970c10",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#970c10",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#970c10",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#666",
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#970c10",
    marginBottom: 20,
  },
  registerButtonText: {
    color: "#970c10",
    fontWeight: "bold",
    fontSize: 16,
  },
  legalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  legalText: {
    color: "#970c10",
    fontSize: 12,
    fontWeight: "500",
  },
  legalDivider: {
    color: "#970c10",
    marginHorizontal: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
});