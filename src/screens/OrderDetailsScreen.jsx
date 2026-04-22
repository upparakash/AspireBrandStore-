import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderDetailsScreen = ({ navigation, route }) => {
  const order = route?.params?.order;

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No Order Data Found</Text>
      </View>
    );
  }

  const address = order.shippingAddress || order.address;

  const subtotal = order.items?.reduce(
    (acc, item) =>
      acc + (item.price || 0) * (item.qty || item.quantity || 1),
    0
  );

  return (
    <>
      <StatusBar backgroundColor="#F5C542" barStyle="dark-content" />

      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>Order Details</Text>
          </View>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Order Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Information</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Order ID</Text>
              <Text style={styles.value}>
                #{order.id || order._id}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>
                {order.status || order.paymentStatus}
              </Text>
            </View>
          </View>

          {/* Products */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Products</Text>

            {order.items?.map((item, index) => (
              <View key={index} style={styles.productRow}>
                <Image
                  source={{ uri: item.imageUrl || item.imageUri }}
                  style={styles.productImg}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>
                    {item.name || item.productName}
                  </Text>
                  <Text style={styles.productQty}>
                    Qty: {item.qty || item.quantity}
                  </Text>
                </View>

                <Text style={styles.productPrice}>
                  ₹{item.price}
                </Text>
              </View>
            ))}
          </View>

          {/* Shipping Address */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>

            {order.fullName && (
              <Text style={styles.addressText}>{order.fullName}</Text>
            )}

            {order.phone && (
              <Text style={styles.addressText}>{order.phone}</Text>
            )}

            {order.address && (
              <Text style={styles.addressText}>{order.address}</Text>
            )}

            {(order.city || order.pincode) && (
              <Text style={styles.addressText}>
                {order.city} {order.city && order.pincode ? " - " : ""}
                {order.pincode}
              </Text>
            )}
          </View>

          {/* Payment Summary */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>₹{subtotal}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Shipping</Text>
              <Text style={styles.value}>
                ₹{order.shippingAmount || 0}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{order.totalAmount}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Payment Method</Text>
              <Text style={styles.value}>
                {order.paymentMethod}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Payment Status</Text>
              <Text style={styles.value}>
                {order.paymentStatus}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* HEADER (Your Style) */
  header: {
    paddingVertical: 18,
    paddingHorizontal: 15,
    backgroundColor: "#F5C542",
    elevation: 4,
  },

  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    marginRight: 10,
    padding: 5,
  },

  backArrow: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },

  /* BODY */
  body: {
    backgroundColor: "#D5E2E6",
    padding: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    color: "#555",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F5C542",
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },

  statusDelivered: {
    color: "green",
    fontWeight: "bold",
  },

  statusPending: {
    color: "orange",
    fontWeight: "bold",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  productImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },

  productName: {
    fontSize: 14,
    fontWeight: "600",
  },

  productQty: {
    fontSize: 12,
    color: "#777",
  },

  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },

  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },

  cancelButton: {
    backgroundColor: "#FF4D4D",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});