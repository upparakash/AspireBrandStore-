import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
  useColorScheme,
  Animated,
  Dimensions,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import Aspirelogo from '../images/Aspirelogo.png';
import axios from "axios";
import { API_URL } from "@env";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(size * scale);

export default function Profile({ navigation }) {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONS!
  
  // Theme and navigation hooks
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isFocused = useIsFocused();
  
  // State hooks
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // DEFAULT_PROFILE as constant (not state)
  const DEFAULT_PROFILE = useMemo(() => ({
    fullName: "Guest User",
    email: "guest@gmail.com",
    phone: "1234567890",
    profile: null,
  }), []);
  
  // Theme colors - memoized
  const colors = useMemo(() => ({
    background: isDarkMode ? "#121212" : "#F8F9FA",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#1A1A2E",
    textSecondary: isDarkMode ? "#AAAAAA" : "#666666",
    textLight: isDarkMode ? "#888888" : "#999999",
    border: isDarkMode ? "#333333" : "#F0F0F0",
    primary: "#D4AF37",
    primaryDark: "#B8942E",
    accent: "#970c10",
    accentLight: isDarkMode ? "#FF6B6B" : "#FFE5E5",
    iconBg: isDarkMode ? "#2C2C2C" : "#F5F5F5",
    shadow: isDarkMode ? "#000000" : "#000000",
    success: "#4CAF50",
    error: "#E53935",
  }), [isDarkMode]);
  
  // Animation effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);
  
  // Fetch profile function
  const fetchProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setFullName(DEFAULT_PROFILE.fullName);
        setEmail(DEFAULT_PROFILE.email);
        setPhone(DEFAULT_PROFILE.phone);
        setProfile(DEFAULT_PROFILE.profile);
        return;
      }
      
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/customers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const user = res.data.data;
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone);
      
      const imageUrl = user.profile
        ? user.profile.startsWith("http")
          ? `${user.profile}?t=${Date.now()}`
          : `${API_URL}${user.profile}?t=${Date.now()}`
        : null;
      
      setProfile(imageUrl);
    } catch (err) {
      console.log("Fetch profile error:", err?.response || err);
    } finally {
      setLoading(false);
    }
  }, [DEFAULT_PROFILE]);
  
  // UseFocusEffect - properly placed at top level
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );
  
  // Logout handler
  const handleLogout = useCallback(() => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");
              setFullName(DEFAULT_PROFILE.fullName);
              setEmail(DEFAULT_PROFILE.email);
              setPhone(DEFAULT_PROFILE.phone);
              setProfile(DEFAULT_PROFILE.profile);
              navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
              });
            } catch (error) {
              console.error("Logout Error:", error);
            }
          },
        },
      ]
    );
  }, [navigation, DEFAULT_PROFILE]);
  
  // Password update handler
  const handlePasswordUpdate = useCallback(async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Missing Fields", "Please fill both password fields.");
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert("Invalid Password", "New password must be at least 6 characters long.");
      return;
    }
    
    setUpdatingPassword(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/api/customers/update-password`,
        { oldPassword: oldPassword.trim(), newPassword: newPassword.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        Alert.alert("Success", "Password updated successfully!");
        setModalVisible(false);
        setOldPassword("");
        setNewPassword("");
      } else {
        Alert.alert("Error", res.data.message || "Password update failed");
      }
    } catch (error) {
      console.log(error?.response || error);
      Alert.alert("Error", error?.response?.data?.message || "Something went wrong");
    } finally {
      setUpdatingPassword(false);
    }
  }, [oldPassword, newPassword]);
  
  // Computed values
  const isGuest = fullName === DEFAULT_PROFILE.fullName;
  
  // Menu items - memoized
  const menuItems = useMemo(() => [
    {
      id: 1,
      icon: "heart",
      iconType: "FontAwesome",
      title: "Wishlist",
      screen: "WishlistScreen",
      color: colors.error,
      action: () => navigation.navigate("WishlistScreen"),
    },
    {
      id: 2,
      icon: "shopping-bag",
      iconType: "FontAwesome",
      title: "My Orders",
      screen: "OrderHistoryScreen",
      color: colors.primary,
      action: () => navigation.navigate("OrderHistoryScreen"),
    },
    {
      id: 3,
      icon: "lock",
      iconType: "FontAwesome",
      title: "Password Update",
      color: colors.accent,
      action: () => setModalVisible(true),
    },
    {
      id: 4,
      icon: "shield",
      iconType: "FontAwesome",
      title: "Privacy Policy",
      screen: "PrivacyPolicy",
      color: colors.textSecondary,
      action: () => navigation.navigate("PrivacyPolicy"),
    },
    {
      id: 5,
      icon: "legal",
      iconType: "FontAwesome",
      title: "Terms & Conditions",
      screen: "TermsConditions",
      color: colors.textSecondary,
      action: () => navigation.navigate("TermsConditions"),
    },
    {
      id: 6,
      icon: "undo",
      iconType: "FontAwesome",
      title: "Return & Refund Policy",
      screen: "ReturnRefundPolicy",
      color: colors.textSecondary,
      action: () => navigation.navigate("ReturnRefundPolicy"),
    },
    {
      id: 7,
      icon: "truck",
      iconType: "FontAwesome",
      title: "Shipping Policy",
      screen: "ShippingPolicyScreen",
      color: colors.textSecondary,
      action: () => navigation.navigate("ShippingPolicyScreen"),
    },
  ], [colors, navigation]);
  
  // Render menu item
  const renderMenuItem = useCallback((item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.optionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={item.action}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
        <FontAwesome name={item.icon} size={20} color={item.color} />
      </View>
      <Text style={[styles.optionText, { color: colors.text }]}>{item.title}</Text>
      <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
    </TouchableOpacity>
  ), [colors]);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.iconBg }]}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>My Profile</Text>
            <View style={{ width: 40 }} />
          </View>
          
          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
            </View>
          ) : (
            <>
              {/* Profile Card */}
              <View style={[styles.profileCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                <View style={styles.profileImageContainer}>
                  <Image
                    source={profile ? { uri: profile } : Aspirelogo}
                    style={[styles.avatar, { borderColor: colors.primary }]}
                  />
                  {!isGuest && (
                    <TouchableOpacity
                      style={[styles.editAvatarBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        navigation.navigate("EditProfileScreen", {
                          fullName,
                          email,
                          phone,
                          profile,
                        });
                      }}
                    >
                      <MaterialIcons name="edit" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <Text style={[styles.name, { color: colors.text }]}>{fullName}</Text>
                <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
                <View style={styles.phoneContainer}>
                  <MaterialIcons name="phone" size={16} color={colors.textLight} />
                  <Text style={[styles.phone, { color: colors.textSecondary }]}>{phone}</Text>
                </View>
              </View>
              
              {/* Menu Items */}
              <View style={styles.menuContainer}>
                {!isGuest && (
                  <TouchableOpacity
                    style={[styles.logoutBtn, { backgroundColor: colors.error }]}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="logout" size={20} color="#FFFFFF" />
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                )}
                
                {isGuest && (
                  <TouchableOpacity
                    style={[styles.loginBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("Login")}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="login" size={20} color="#FFFFFF" />
                    <Text style={styles.loginText}>Login to Your Account</Text>
                  </TouchableOpacity>
                )}
                
                {menuItems.map(renderMenuItem)}
              </View>
              
              {/* App Version */}
              <Text style={[styles.versionText, { color: colors.textLight }]}>
                Version 1.0.0
              </Text>
            </>
          )}
        </Animated.View>
      </ScrollView>
      
      {/* Password Update Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { backgroundColor: colors.card, transform: [{ scale: fadeAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>Update Password</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            {/* Old Password */}
            <View style={[styles.passwordContainer, { borderColor: colors.border, backgroundColor: colors.iconBg }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Old Password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.eyeIcon}>
                <Icon name={showOldPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            {/* New Password */}
            <View style={[styles.passwordContainer, { borderColor: colors.border, backgroundColor: colors.iconBg }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="New Password (min 6 characters)"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                <Icon name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handlePasswordUpdate}
                disabled={updatingPassword}
              >
                {updatingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButtonCancel, { backgroundColor: colors.iconBg, borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingBottom: normalize(30),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: normalize(100),
  },
  loadingText: {
    marginTop: normalize(12),
    fontSize: normalize(14),
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(16),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: normalize(22),
    fontWeight: '700',
  },
  profileCard: {
    marginHorizontal: normalize(16),
    marginVertical: normalize(20),
    paddingVertical: normalize(30),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(20),
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: normalize(16),
  },
  avatar: {
    width: normalize(100),
    height: normalize(100),
    borderRadius: normalize(50),
    borderWidth: 3,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: normalize(22),
    fontWeight: '700',
    marginBottom: normalize(4),
  },
  email: {
    fontSize: normalize(14),
    marginBottom: normalize(8),
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  phone: {
    fontSize: normalize(14),
  },
  menuContainer: {
    paddingHorizontal: normalize(16),
    gap: normalize(12),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(12),
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconWrapper: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  optionText: {
    flex: 1,
    fontSize: normalize(15),
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(14),
    borderRadius: normalize(12),
    gap: normalize(8),
    marginBottom: normalize(8),
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(14),
    borderRadius: normalize(12),
    gap: normalize(8),
    marginBottom: normalize(8),
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: normalize(12),
    marginTop: normalize(24),
    marginBottom: normalize(16),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: normalize(20),
    padding: normalize(20),
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  modalTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: normalize(12),
    marginBottom: normalize(15),
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    padding: normalize(14),
    fontSize: normalize(14),
  },
  eyeIcon: {
    paddingHorizontal: normalize(12),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalize(12),
    marginTop: normalize(8),
  },
  modalButton: {
    flex: 1,
    paddingVertical: normalize(12),
    borderRadius: normalize(10),
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: normalize(14),
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: normalize(12),
    borderRadius: normalize(10),
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonCancelText: {
    fontWeight: '600',
    fontSize: normalize(14),
  },
});