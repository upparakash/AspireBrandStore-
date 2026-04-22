import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageCropPicker from "react-native-image-crop-picker";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import { API_URL } from "@env";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 360;

const EditProfileScreen = ({ route, navigation }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const insets = useSafeAreaInsets();
  const { fullName, email, phone, profile } = route.params;

  const [name, setName] = useState(fullName || "");
  const [userEmail, setUserEmail] = useState(email || "");
  const [userPhone, setUserPhone] = useState(phone || "");
  const [userProfile, setUserProfile] = useState(profile || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
  }, [colorScheme]);

  const colors = {
    background: isDarkMode ? "#0a0a0a" : "#f8fafc",
    surface: isDarkMode ? "#1a1a1a" : "#ffffff",
    card: isDarkMode ? "#2a2a2a" : "#ffffff",
    text: isDarkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: isDarkMode ? "#94a3b8" : "#475569",
    textTertiary: isDarkMode ? "#64748b" : "#64748b",
    accent: "#6366f1",
    accentLight: isDarkMode ? "#818cf8" : "#6366f1",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    highlight: isDarkMode ? "#334155" : "#f1f5f9",
    error: "#ef4444",
    success: "#10b981",
    inputBg: isDarkMode ? "#2a2a2a" : "#ffffff",
    placeholder: isDarkMode ? "#64748b" : "#94a3b8",
  };

  // ---------------------------------------------------
  // STORAGE PERMISSION (Android 13+)
  // ---------------------------------------------------
  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.log("Permission Error:", err);
        return false;
      }
    }
    return true;
  };

  // ---------------------------------------------------
  // CAMERA PERMISSION
  // ---------------------------------------------------
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // ---------------------------------------------------
  // IMAGE PICKER
  // ---------------------------------------------------
  const handleChooseProfile = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Storage permission required.");
      return;
    }

    Alert.alert(
      "Select Image",
      "Choose an option to update your profile picture",
      [
        {
          text: "Camera",
          onPress: async () => {
            const camPerm = await requestCameraPermission();
            if (!camPerm) {
              Alert.alert("Permission Denied", "Camera permission required.");
              return;
            }

            try {
              const image = await ImageCropPicker.openCamera({
                width: 300,
                height: 300,
                cropping: true,
                cropperCircleOverlay: true,
                compressImageQuality: 0.7,
              });

              if (image?.path) {
                setUserProfile(
                  image.path.startsWith("file://")
                    ? image.path
                    : `file://${image.path}`
                );
              }
            } catch (err) {
              if (err.code !== "E_PICKER_CANCELLED") console.log(err);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            try {
              const image = await ImageCropPicker.openPicker({
                width: 300,
                height: 300,
                cropping: true,
                cropperCircleOverlay: true,
                compressImageQuality: 0.7,
              });

              if (image?.path) {
                setUserProfile(
                  image.path.startsWith("file://")
                    ? image.path
                    : `file://${image.path}`
                );
              }
            } catch (err) {
              if (err.code !== "E_PICKER_CANCELLED") console.log(err);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // ---------------------------------------------------
  // SAVE PROFILE (API)
  // ---------------------------------------------------
  const saveUpdates = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your full name");
      return;
    }
    if (!userEmail.trim()) {
      Alert.alert("Validation Error", "Please enter your email");
      return;
    }
    if (!userPhone.trim()) {
      Alert.alert("Validation Error", "Please enter your phone number");
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Session expired. Please login again.");
        navigation.replace("Login");
        return;
      }

      const formData = new FormData();
      formData.append("fullName", name);
      formData.append("email", userEmail);
      formData.append("phone", userPhone);

      if (userProfile && userProfile.startsWith("file://")) {
        formData.append("profile", {
          uri: userProfile,
          type: "image/jpeg",
          name: `profile_${Date.now()}.jpg`,
        });
      }

      const res = await axios.put(
        `${API_URL}/api/customers/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedProfileUrl = res?.data?.data?.profile;
      if (updatedProfileUrl) {
        await AsyncStorage.setItem("profile", updatedProfileUrl);
      }

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const data = error?.response?.data;

      if (data?.errorType === "DUPLICATE_PHONE") {
        Alert.alert("Duplicate Phone", "This phone number is already registered.");
        return;
      }

      if (data?.errorType === "DUPLICATE_EMAIL") {
        Alert.alert("Duplicate Email", "This email is already registered.");
        return;
      }

      Alert.alert("Update Failed", data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header with proper safe area handling */}
        <View style={[
          styles.header, 
          { 
            borderBottomColor: colors.border,
            paddingTop: insets.top > 0 ? 0 : 16,
          }
        ]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 20 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Profile Image Section */}
            <TouchableOpacity
              onPress={handleChooseProfile}
              style={styles.profileImageContainer}
              activeOpacity={0.8}
            >
              <View style={[styles.avatarWrapper, { borderColor: colors.accent }]}>
                <Image
                  source={
                    userProfile?.startsWith("http")
                      ? { uri: userProfile }
                      : userProfile
                      ? { uri: userProfile }
                      : require("../images/Aspirelogo.png")
                  }
                  style={styles.avatar}
                />
                <View style={[styles.cameraIcon, { backgroundColor: colors.accent }]}>
                  <Icon name="camera-outline" size={16} color="#ffffff" />
                </View>
              </View>
              <Text style={[styles.editText, { color: colors.textSecondary }]}>
                Tap to change photo
              </Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Icon name="person-outline" size={20} color={colors.accent} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.placeholder}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icon name="mail-outline" size={20} color={colors.accent} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  placeholder="Email Address"
                  placeholderTextColor={colors.placeholder}
                  value={userEmail}
                  onChangeText={setUserEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icon name="call-outline" size={20} color={colors.accent} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.placeholder}
                  value={userPhone}
                  onChangeText={setUserPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={saveUpdates}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Icon name="save-outline" size={20} color="#ffffff" style={styles.saveIcon} />
                  <Text style={styles.saveText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.highlight, borderColor: colors.border }]}>
              <Icon name="information-circle-outline" size={20} color={colors.accent} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Your profile information helps us personalize your experience
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ---------------------------------------------------
// STYLES
// ---------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: isSmallDevice ? 20 : 30,
    alignItems: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    borderWidth: 3,
    borderRadius: 70,
    padding: 2,
  },
  avatar: {
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    borderRadius: isSmallDevice ? 50 : 60,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  editText: {
    fontSize: isSmallDevice ? 12 : 13,
    marginTop: 12,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: isSmallDevice ? 12 : 14,
    paddingLeft: 44,
    paddingRight: 12,
    fontSize: isSmallDevice ? 14 : 15,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
  },
  saveBtn: {
    backgroundColor: "#6366f1",
    paddingVertical: isSmallDevice ? 14 : 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    flexDirection: "row",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveText: {
    color: "#ffffff",
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
export default EditProfileScreen;