import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { API_URL } from "@env";

export default function PaymentScreen({ route, navigation }) {
  const { orderData } = route.params;
  const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    createPayment();
  }, []);

  const createPayment = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderData.totalAmount,
          userId: orderData.user_id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert("Payment Error", "Unable to start payment");
        navigation.goBack();
        return;
      }

      setPaymentUrl(data.paymentUrl);
    } catch (err) {
      console.log("Payment error:", err);
      Alert.alert("Error", "Payment initialization failed");
      navigation.goBack();
    }
  };

  if (!paymentUrl) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={(navState) => {
        if (navState.url.includes("payment-success")) {
          Alert.alert("Success", "Payment completed successfully!");
          navigation.navigate("Main");
        }
      }}
    />
  );
}
