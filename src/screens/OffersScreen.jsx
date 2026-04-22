import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function OffersScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIcon}
        >
          <FontAwesome name="arrow-left" size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Exclusive Offers</Text>
      </View>

      {/* Content */}
      <View style={styles.emptyContainer}>
        <Text style={styles.noOfferText}>No offers available</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D5E2E6",
    paddingTop: 50,
    paddingHorizontal: 15,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#D5E2E6",
    marginBottom: 20,
  },

  backIcon: {
    marginRight: 15,
    padding: 5,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#970c10",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noOfferText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
});
