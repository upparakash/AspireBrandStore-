import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Animated,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const numColumns = 2;
const cardMargin = 16;
const cardWidth = (width - cardMargin * (numColumns + 1)) / numColumns;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Theme colors
  const colors = {
    background: isDarkMode ? "#121212" : "#F8F9FA",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#1A1A2E",
    textSecondary: isDarkMode ? "#AAAAAA" : "#666666",
    textLight: isDarkMode ? "#888888" : "#999999",
    border: isDarkMode ? "#333333" : "#F0F0F0",
    primary: "#c1a37f",
    primaryDark: "#a88963",
    gradientStart: isDarkMode ? "#2C2C2C" : "#FFFFFF",
    gradientEnd: isDarkMode ? "#1E1E1E" : "#F5F5F5",
    shadow: isDarkMode ? "#000000" : "#000000",
    iconBg: isDarkMode ? "#2C2C2C" : "#F5F5F5",
  };

  useEffect(() => {
    fetchCategories();
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
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

  const renderCategory = ({ item, index }) => {
    // ✅ Create animation value directly (not using useRef)
    const translateY = new Animated.Value(50);
    
    // Start the animation immediately
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            width: cardWidth,
            marginHorizontal: cardMargin / 2,
            transform: [{ translateY }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => {
            navigation.navigate("Home", {
              category: item.productCategory,
            });
          }}
        >
          <View style={[styles.imageContainer, { backgroundColor: colors.iconBg }]}>
            <Image
              source={{ uri: `${API_URL}${item.productCategoryImage}` }}
              style={styles.productImage}
              resizeMode="contain"
              onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
            />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={[styles.cardText, { color: colors.text }]} numberOfLines={2}>
              {item.productCategory}
            </Text>
            <View style={styles.exploreContainer}>
              <Text style={[styles.exploreText, { color: colors.primary }]}>Explore</Text>
              <Icon name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </View>
          
          <View style={[styles.cardOverlay, { backgroundColor: colors.primary }]} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading categories...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: colors.iconBg }]}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: colors.text }]}>Shop by Category</Text>
        
        <View style={styles.placeholder} />
      </Animated.View>

      <Animated.View 
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{categories.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Categories</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>1000+</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Products</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>24/7</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Support</Text>
        </View>
      </Animated.View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategory}
        numColumns={numColumns}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="category" size={64} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No categories available
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  flatListContent: {
    paddingHorizontal: cardMargin / 2,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: cardMargin,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  exploreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    transform: [{ scaleX: 0 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});