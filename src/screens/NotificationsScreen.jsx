import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const saved = await AsyncStorage.getItem("notifications");
        if (saved) setNotifications(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };
    loadNotifications();
  }, []);

  // Delete single notification
  const handleRemove = async (id) => {
    const updated = notifications.filter((item) => item.id !== id);
    setNotifications(updated);
    await AsyncStorage.setItem("notifications", JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIcon}
        >
          <FontAwesome name="arrow-left" size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications 🔔</Text>
      </View>

      {/* EMPTY VIEW */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="bell-o" size={60} color="#d4af37" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>{item.message}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
              </View>

              {/* Delete */}
              <TouchableOpacity onPress={() => handleRemove(item.id)}>
                <FontAwesome name="trash" size={22} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

// STYLES
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
  },

  backIcon: {
    marginRight: 15,
    padding: 5,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#d4af37",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },

  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  itemTime: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#777",
    marginTop: 10,
  },
});

