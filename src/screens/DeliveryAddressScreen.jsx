import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PhonePePaymentSDK from "react-native-phonepe-pg";
import { removeFromCart } from "../redux/slices/cartSlice";
import { API_URL } from "@env";
import { PHONEPE_MERCHANT_ID } from "@env";
import { PHONEPE_ENV } from "@env";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

export default function DeliveryAddressScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const items = route.params?.items ?? [];
  const total = items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");

  const [loadingPin, setLoadingPin] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Colors based on theme
  const colors = {
    background: isDarkMode ? "#121212" : "#F5F7FA",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#1A1A2E",
    textSecondary: isDarkMode ? "#AAAAAA" : "#666666",
    border: isDarkMode ? "#333333" : "#E8ECF0",
    primary: "#6739B7",
    primaryDark: "#5A32A3",
    success: "#28A745",
    error: "#DC3545",
    warning: "#FFC107",
    icon: isDarkMode ? "#AAAAAA" : "#888888",
  };

  // ================= LOAD PROFILE =================
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Login Required", "Please login to continue");
          navigation.navigate("Login");
          return;
        }
        const res = await fetch(`${API_URL}/api/customers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (json?.data) {
          setFullName(json.data.fullName);
          setEmail(json.data.email);
          setPhone(json.data.phone);
        }
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
        Alert.alert("Error", "Failed to load profile");
      }
    })();
  }, []);

  // ================= VALIDATION FUNCTIONS =================
  const validateAddress = () => {
    const trimmedAddress = address?.trim() || "";

    if (
      trimmedAddress.length < 15 ||
      !/[a-zA-Z]/.test(trimmedAddress) ||
      !/\d/.test(trimmedAddress)
    ) {
      Alert.alert(
        "Invalid Address",
        "Please enter a complete address with:\n• Minimum 15 characters\n• Street name and building number\n• Include letters and numbers"
      );
      return false;
    }
    return true;
  };

  const validatePincode = async (pin) => {
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setCity("");
      if (pin.length > 0 && pin.length < 6) {
        Alert.alert("Invalid Pincode", "Pincode must be exactly 6 digits");
      } else if (pin.length === 6 && !/^[1-9][0-9]{5}$/.test(pin)) {
        Alert.alert("Invalid Pincode", "Pincode must start with a digit from 1-9");
      }
      return false;
    }

    try {
      setLoadingPin(true);
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === "Success") {
        setCity(data[0].PostOffice[0].District);
        return true;
      } else {
        setCity("");
        Alert.alert("Invalid Pincode", "Please enter a valid Indian pincode");
        return false;
      }
    } catch (err) {
      setCity("");
      Alert.alert("Error", "Failed to validate pincode. Please check your internet connection");
      return false;
    } finally {
      setLoadingPin(false);
    }
  };

  const validateAllFields = () => {
    if (!fullName || fullName.trim().length === 0) {
      Alert.alert("Missing Information", "Please enter your full name");
      return false;
    }

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number");
      return false;
    }

    const trimmedAddress = address?.trim() || "";
    if (
      trimmedAddress.length < 15 ||
      !/[a-zA-Z]/.test(trimmedAddress) ||
      !/\d/.test(trimmedAddress)
    ) {
      Alert.alert(
        "Invalid Address",
        "Please enter a complete address with:\n• Minimum 15 characters\n• Street name and building number\n• Include letters and numbers"
      );
      return false;
    }

    if (!pincode || pincode.length !== 6) {
      Alert.alert("Invalid Pincode", "Please enter a valid 6-digit pincode");
      return false;
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      Alert.alert("Invalid Pincode", "Pincode must start with a digit from 1-9");
      return false;
    }

    if (!city) {
      Alert.alert("Invalid Pincode", "Please enter a valid pincode to fetch city details");
      return false;
    }

    return true;
  };

  // ================= CREATE ORDER =================
  const createOrder = async (paymentMethod = "COD", merchantTransactionId = null) => {
    const trimmedAddress = address?.trim() || "";

    if (!trimmedAddress || trimmedAddress.length < 15 || !pincode || !city) {
      throw new Error("Invalid address details");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          phone,
          address: trimmedAddress,
          city,
          pincode,
          items,
          totalAmount: total,
          paymentMethod,
          merchantTransactionId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error("Order creation failed");

      items.forEach((i) => dispatch(removeFromCart(i.id)));

      return data;
    } catch (err) {
      console.error("❌ Order creation failed:", err);
      throw err;
    }
  };

  // ================= PHONEPE PAYMENT =================
  const startPhonePePayment = async () => {
    try {
      if (!validateAllFields()) return;
      setLoadingPay(true);
      
      const authToken = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/phonepe/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          amount: total,
          fullName,
          phone,
          address: address?.trim(),
          city,
          pincode,
          items,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        Alert.alert("Payment Error", "Unable to initiate payment. Please try again.");
        return;
      }

      const { merchantTransactionId, merchantOrderId, phonePeOrderId, token } = result;
      if (!phonePeOrderId) {
        Alert.alert("Error", "Invalid order ID from server");
        return;
      }

      await PhonePePaymentSDK.init(
        PHONEPE_ENV,
        PHONEPE_MERCHANT_ID,
        `FLWID_${Date.now()}`,
        true
      );

      const requestBody = JSON.stringify({
        orderId: phonePeOrderId,
        merchantId: PHONEPE_MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        token: token,
        paymentMode: {
          type: "PAY_PAGE",
        },
      });

      const sdkResponse = await PhonePePaymentSDK.startTransaction(requestBody, null);

      if (sdkResponse?.status === "SUCCESS" || sdkResponse?.status === "FAILURE") {
        const verifyRes = await fetch(
          `${API_URL}/api/phonepe/status/${merchantOrderId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const verifyData = await verifyRes.json();
        
        if (verifyData.paymentStatus === "PAID") {
          items.forEach((i) => dispatch(removeFromCart(i.id)));
          navigation.replace("OrderSuccess", {
            orderId: merchantTransactionId,
            totalAmount: total,
          });
        } else if (verifyData.paymentStatus === "PENDING") {
          Alert.alert("Payment Pending", "Your payment is being processed. Please wait a moment.");
        } else {
          Alert.alert("Payment Failed", "Transaction was not successful. Please try again.");
        }
      }
    } catch (err) {
      console.error("🔥 Payment Exception:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoadingPay(false);
    }
  };

  // ================= CASH ON DELIVERY =================
  const placeCodOrder = async () => {
    try {
      if (!validateAllFields()) return;
      setLoadingPay(true);
      await createOrder("COD");
      navigation.replace("OrderSuccess");
    } catch (err) {
      Alert.alert("Order Failed", "Unable to place order. Please try again.");
    } finally {
      setLoadingPay(false);
    }
  };

  // ================= UI COMPONENTS =================
  const renderInputField = (label, value, onChange, placeholder, keyboardType = "default", editable = true, icon = null) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
        {icon && <Icon name={icon} size={20} color={colors.icon} style={styles.inputIcon} />}
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Delivery Address</Text>
          </View>

          {/* Order Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
            {items.map((i) => (
              <View key={i.id} style={styles.itemRow}>
                <Image source={{ uri: i.imageUri }} style={styles.image} />
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                    {i.name}
                  </Text>
                  <Text style={[styles.itemQty, { color: colors.textSecondary }]}>Qty: {i.qty}</Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{i.price * i.qty}</Text>
                </View>
              </View>
            ))}
            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{total}</Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
            {renderInputField("Full Name", fullName, setFullName, "Enter your full name", "default", false, "person")}
            {renderInputField("Email", email, setEmail, "Email address", "email-address", false, "email")}
            {renderInputField("Phone Number", phone, setPhone, "10-digit mobile number", "phone-pad", true, "phone")}
          </View>

          {/* Address Information */}
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Address Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Street Address</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Icon name="location-on" size={20} color={colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.card }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="House/Flat No., Street, Landmark"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Include building number, street name, and area (min 15 characters)
              </Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.halfWidth, styles.mr10]}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Pincode</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <Icon name="pin-drop" size={20} color={colors.icon} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                      placeholder="6-digit pincode"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={pincode}
                      onChangeText={async (t) => {
                        setPincode(t);
                        if (t.length === 6) {
                          await validatePincode(t);
                        } else if (t.length === 0) {
                          setCity("");
                        }
                      }}
                    />
                    {loadingPin && <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />}
                  </View>
                </View>
              </View>
              <View style={styles.halfWidth}>
                {renderInputField("City", city, setCity, "City name", "default", false, "location-city")}
              </View>
            </View>
          </View>

          {/* Payment Buttons */}
          <View style={styles.paymentContainer}>
            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: colors.primary }]}
              onPress={startPhonePePayment}
              disabled={loadingPay}
            >
              {loadingPay ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="payment" size={24} color="#FFFFFF" />
                  <Text style={styles.paymentButtonText}>Pay with PhonePe</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: colors.success }]}
              onPress={placeCodOrder}
              disabled={loadingPay}
            >
              {loadingPay ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="money" size={24} color="#FFFFFF" />
                  <Text style={styles.paymentButtonText}>Cash on Delivery</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            By placing an order, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formCard: {
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    flex: 1,
  },
  mr10: {
    marginRight: 10,
  },
  loader: {
    marginLeft: 5,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF0",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  paymentContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  paymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 20,
    marginHorizontal: 20,
  },
});