import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(size * scale);

export default function Wishlist({ navigation }) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Store individual item animations
  const itemAnimations = useRef({}).current;
  
  // Theme colors
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
    error: "#E53935",
  }), [isDarkMode]);
  
  // Helper function to get or create animation for an item
  const getItemAnimation = useCallback((itemId, index) => {
    if (!itemAnimations[itemId]) {
      itemAnimations[itemId] = {
        opacity: new Animated.Value(0),
        translateX: new Animated.Value(50),
      };
      
      // Start animation with delay based on index
      Animated.parallel([
        Animated.timing(itemAnimations[itemId].opacity, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(itemAnimations[itemId].translateX, {
          toValue: 0,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    return itemAnimations[itemId];
  }, [itemAnimations]);
  
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
  
  // Load wishlist function
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const savedList = await AsyncStorage.getItem('wishlist');
      if (savedList) {
        setWishlist(JSON.parse(savedList));
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadWishlist();
      // Clear animations when wishlist changes
      Object.keys(itemAnimations).forEach(key => delete itemAnimations[key]);
    }, [loadWishlist, itemAnimations])
  );
  
  // Remove item from wishlist
  const handleRemove = useCallback(async (id, title) => {
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove "${title}" from your wishlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedList = wishlist.filter((item) => item.id !== id);
              setWishlist(updatedList);
              await AsyncStorage.setItem('wishlist', JSON.stringify(updatedList));
              // Clean up animation for removed item
              delete itemAnimations[id];
              Alert.alert('Removed', 'Item removed from wishlist.');
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  }, [wishlist, itemAnimations]);
  
  // Clear all wishlist
  const handleClearAll = useCallback(() => {
    if (wishlist.length === 0) return;
    
    Alert.alert(
      "Clear Wishlist",
      "Are you sure you want to remove all items from your wishlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              setWishlist([]);
              await AsyncStorage.setItem('wishlist', JSON.stringify([]));
              // Clear all animations
              Object.keys(itemAnimations).forEach(key => delete itemAnimations[key]);
              Alert.alert('Cleared', 'All items removed from wishlist.');
            } catch (error) {
              console.error('Error clearing wishlist:', error);
              Alert.alert('Error', 'Failed to clear wishlist');
            }
          },
        },
      ]
    );
  }, [wishlist.length, itemAnimations]);
  
  // Navigate to product details
  const handleProductPress = useCallback((item) => {
    navigation.navigate('ProductDetails', {
      productId: item.id,
    });
  }, [navigation]);
  
  // Handle add to cart
  const handleAddToCart = useCallback((item) => {
    Alert.alert('Coming Soon', 'Add to cart feature coming soon!');
  }, []);
  
  // Render each wishlist item - NO HOOKS INSIDE!
  const renderItem = useCallback(({ item, index }) => {
    const animation = getItemAnimation(item.id, index);
    
    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: animation.opacity,
            transform: [{ translateX: animation.translateX }],
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() => handleProductPress(item)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
            
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                ₹{item.price}
              </Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.cartBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleAddToCart(item)}
                >
                  <MaterialIcons name="shopping-cart" size={16} color="#FFFFFF" />
                  <Text style={styles.cartBtnText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.removeBtn, { backgroundColor: colors.iconBg }]}
            onPress={() => handleRemove(item.id, item.title)}
          >
            <MaterialIcons name="delete-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }, [colors, handleProductPress, handleRemove, handleAddToCart, getItemAnimation]);
  
  // Header component
  const Header = useCallback(() => (
    <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.iconBg }]}>
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: colors.primary }]}>My Wishlist</Text>
      
      {wishlist.length > 0 && (
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
          <MaterialIcons name="delete-sweep" size={22} color={colors.error} />
        </TouchableOpacity>
      )}
    </Animated.View>
  ), [colors, fadeAnim, slideAnim, navigation, wishlist.length, handleClearAll]);
  
  // Empty state component
  const EmptyState = useCallback(() => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.iconBg }]}>
        <MaterialIcons name="favorite-border" size={80} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Your wishlist is empty</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start adding items you love to your wishlist
      </Text>
      <TouchableOpacity
        style={[styles.shopBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.shopBtnText}>Start Shopping</Text>
        <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  ), [colors, fadeAnim, slideAnim, navigation]);
  
  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <Header />
      
      {wishlist.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { color: colors.textSecondary }]}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
            </Text>
          </View>
          
          <FlatList
            data={wishlist}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={7}
          />
        </>
      )}
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
    marginTop: normalize(12),
    fontSize: normalize(14),
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  clearButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  statsText: {
    fontSize: normalize(13),
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(20),
  },
  cardWrapper: {
    marginBottom: normalize(12),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(12),
    borderRadius: normalize(16),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(12),
    marginRight: normalize(12),
    backgroundColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    marginBottom: normalize(4),
    lineHeight: normalize(20),
  },
  itemPrice: {
    fontSize: normalize(16),
    fontWeight: '700',
    marginBottom: normalize(8),
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(20),
    gap: normalize(4),
  },
  cartBtnText: {
    color: '#FFFFFF',
    fontSize: normalize(11),
    fontWeight: '600',
  },
  removeBtn: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: normalize(8),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  emptyIconContainer: {
    width: normalize(140),
    height: normalize(140),
    borderRadius: normalize(70),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(24),
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    marginBottom: normalize(8),
  },
  emptySubtitle: {
    fontSize: normalize(14),
    textAlign: 'center',
    marginBottom: normalize(24),
    paddingHorizontal: normalize(20),
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(24),
    borderRadius: normalize(25),
    gap: normalize(8),
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontWeight: '600',
  },
});