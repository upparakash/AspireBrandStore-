import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ImageCropPicker from "react-native-image-crop-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from "@env";
export default function RegisterScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState(null);

  //  Safe storage helper
  const saveToStorage = async (key, value) => {
    try {
      if (value === null || value === undefined) {
        await AsyncStorage.removeItem(key);
      } else {
        await AsyncStorage.setItem(key, String(value));
      }
    } catch (error) {
      console.error(`AsyncStorage error for key "${key}":`, error);
    }
  };

  //  Request permission for image access
  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: "Image Access Permission",
              message: "This app needs access to your photos to set a profile picture.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "App needs access to your storage to select a profile picture",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn("Permission error:", err);
        return false;
      }
    }
    return true;
  };

  //  Handle image selection (camera or gallery) with circular crop
  const handleChooseProfile = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Cannot access photos without permission.");
      return;
    }

    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: async () => {
            try {
              const image = await ImageCropPicker.openCamera({
                width: 300,
                height: 300,
                cropping: true,
                cropperCircleOverlay: true,
                compressImageQuality: 0.7,
              });
              if (image?.path) setProfile(image.path);
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
              if (image?.path) setProfile(image.path);
            } catch (err) {
              if (err.code !== "E_PICKER_CANCELLED") console.log(err);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  //  Register function
  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Missing Details", "Please fill all fields!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match!");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);

    if (profile) {
      formData.append("profile", {
        uri: profile,
        name: "profile.jpg",
        type: "image/jpeg",
      });
    }

    try {
      console.log(" Sending Registration Request...");
      const response = await fetch(`${API_URL}/api/customers/register`, {
  method: "POST",
  headers: {
    "Content-Type": "multipart/form-data",
  },
  body: formData,
});

      const data = await response.json();
      console.log("📥 Registration Response:", data);

      if (data.success) {
        //  Save data safely to AsyncStorage
        await saveToStorage("fullName", data.fullName || fullName);
        await saveToStorage("email", data.email || email);
        await saveToStorage("phone", data.phone || phone);
        await saveToStorage("profile", data.profile || profile);
        


        Alert.alert(" Success", "Registration successful!", [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("Main", {
                fullName: data.fullName || fullName,
                email: data.email || email,
                phone: data.phone || phone,
              }),
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("❌ Registration Error:", error);

      if (error.message?.includes("email")) {
        Alert.alert("Email Already Exists", "Try using another email.");
      } else if (error.message?.includes("phone")) {
        Alert.alert("Phone Number Already Exists", "Try using another number.");
      } else {
        Alert.alert("Error", "Something went wrong! Please try again.");
      }
    }

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888" 
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888" 
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#888" 
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.profileButton} onPress={handleChooseProfile}>
        <Text style={styles.profileButtonText}>Choose Profile Photo</Text>
      </TouchableOpacity>

      {profile && <Image source={{ uri: profile }} style={styles.profileImage} />}

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#888" 
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor="#888" 
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>


      <TouchableOpacity style={styles.profileButton} onPress={handleRegister}>
        <Text style={styles.profileButtonText}>Register</Text>
      </TouchableOpacity>

      {/*  Text link for existing users */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={styles.loginLinkContainer}
      >
        <Text style={styles.loginLinkText}>I already have an account. Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#D5E2E6" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 20, color: "#970c10" },
  input: {
    width: "100%",        //  REQUIRED on all Android devices
    minWidth: 150,        //  prevents collapsing on small screens
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  profileButton: {
    backgroundColor: "#c1a37f",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  profileButtonText: { color: "#970c10", fontWeight: "bold" },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // circular preview
    alignSelf: "center",
    marginBottom: 10,
  },
  loginLinkContainer: {

    marginTop: 15,
    alignItems: "center",
  },
  loginLinkText: {
    width: "100%",     //  FIX for disappearing text
    color: "#970c10",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    height: 45,
  },

  eyeIcon: {
    padding: 5,
  },

});
