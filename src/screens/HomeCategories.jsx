import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
export default function HomeCategories({ onSelectCategory, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/productCategories`);
      setCategories(res.data);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedCategory === item.productCategory;

    return (
      <TouchableOpacity
        style={styles.categoryContainer}
        onPress={() => onSelectCategory(item.productCategory)}
      >
        <View
          style={[
            styles.avatarWrapper,
            isSelected && styles.selectedAvatarBorder,
          ]}
        >
          <Image
             source={{ uri: `${API_URL}${item.productCategoryImage}` }}
            style={styles.avatarImage}
          />
        </View>

        <Text
          style={[
            styles.categoryText,
            isSelected && styles.selectedCategoryText,
          ]}
          numberOfLines={1}
        >
          {item.productCategory}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ marginTop: 20 }}
        color="#0f1311"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Categories</Text>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
    // backgroundColor: '#D5E2E6',
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f1311",
    marginLeft: 10,
    marginBottom: 5,
  },
  categoryContainer: {
    alignItems: "center",
    marginRight: 18,
  },
  avatarWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    padding: 5,
  },
  selectedAvatarBorder: {
    borderWidth: 3,
    borderColor: "#0f1311",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    resizeMode: "cover",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
    width: 80,
    textAlign: "center",
  },
  selectedCategoryText: {
    color: "#0f1311",
    fontWeight: "bold",
  },
});
