import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle, Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function OrderSuccessScreen({ route }) {
  const navigation = useNavigation();
  const { orderId, totalAmount } = route.params || {};

  const [checking, setChecking] = useState(true);

  const circleAnim = useRef(new Animated.Value(0)).current;
  const tickAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    verifyAgain();
  }, []);

  const verifyAgain = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/phonepe/status/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.paymentStatus === "PAID") {
        startAnimation();
      }
    } catch (err) {
      console.log("Verification error:", err);
    } finally {
      setChecking(false);
    }
  };

  const startAnimation = () => {
    Animated.timing(circleAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(tickAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  };

  const circleScale = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  const tickStrokeOffset = tickAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });

  return (
    <View style={styles.container}>
      {checking ? (
        <>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 15 }}>
            Verifying Payment...
          </Text>
        </>
      ) : (
        <>
          <Animated.View style={{ transform: [{ scale: circleScale }] }}>
            <Svg width={100} height={100} viewBox="0 0 24 24">
              <Circle
                cx="12"
                cy="12"
                r="10"
                stroke="#28A745"
                strokeWidth={3}
                fill="none"
              />
              <Path
                d="M6 12 L10 16 L18 8"
                stroke="#28A745"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="22"
                strokeDashoffset={tickStrokeOffset}
              />
            </Svg>
          </Animated.View>

          <Text style={styles.title}>
            🎉 Payment Successful!
          </Text>

          <Text style={styles.text}>
            Order ID: {orderId}
          </Text>

          <Text style={styles.text}>
            Total Paid: ₹{totalAmount}
          </Text>

          <Text style={styles.message}>
            Thank you for shopping with us.
          </Text>
        </>
      )}

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Main")}
      >
        <Text style={styles.btnText}>
          Continue Shopping
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loaderContainer: {
    alignItems: "center",
  },

  verifyingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    color: "#28A745",
  },

  orderText: {
    fontSize: 16,
    marginTop: 15,
    color: "#444",
  },

  amountText: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    color: "#000",
  },

  bold: {
    fontWeight: "600",
  },

  message: {
    fontSize: 14,
    marginTop: 15,
    color: "#777",
    textAlign: "center",
  },

  btn: {
    marginTop: 40,
    backgroundColor: "#28A745",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
