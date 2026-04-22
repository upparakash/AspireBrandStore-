import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

export default function PaymentStatusScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    success,
    orderId,
    reason,
    retryData,
  } = route.params || {};

  return (
    <View style={styles.container}>
      {/* ✅ SUCCESS */}
      {success ? (
        <>
          <Icon name="checkmark-circle" size={90} color="#2ecc71" />
          <Text style={styles.title}>Payment Successful</Text>
          <Text style={styles.subText}>
            Your order has been placed successfully 🎉
          </Text>

          <Text style={styles.orderId}>
            Order ID: {orderId}
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace("Main")}
          >
            <Text style={styles.btnText}>Go to Home</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* ❌ FAILURE */}
          <Icon name="close-circle" size={90} color="#e74c3c" />
          <Text style={styles.title}>Payment Failed</Text>

          <Text style={styles.subText}>
            {reason || "Something went wrong. Please try again."}
          </Text>

          {/* 🔁 Retry */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.replace("PaymentScreen", {
                orderData: retryData,
              })
            }
          >
            <Text style={styles.btnText}>Retry Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.replace("Main")}
          >
            <Text style={styles.secondaryText}>Go to Home</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },
  subText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    color: "#555",
  },
  orderId: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#d4af37",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 25,
    width: "80%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryBtn: {
    marginTop: 15,
  },
  secondaryText: {
    color: "#555",
    fontSize: 15,
  },
});
