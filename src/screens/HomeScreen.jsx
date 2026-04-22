// screens/HomeScreen.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Share from "react-native-share";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import { useNavigation, useIsFocused, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import Aspirelogo from "../images/AspireBrandBag.png";
import Slides from "./Slides";
import HomeCategories from "./HomeCategories";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import { updateCartPrices } from "../redux/slices/cartSlice";
import Voice from "@react-native-voice/voice";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { API_URL } from "@env";
import Jewellerybox from '../images/Jewellerybox.png';

const { width, height } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;
const scale = width / 375;

export default function HomeScreen() {
  // ALL HOOKS MUST BE CALLED IN THE SAME ORDER EVERY TIME
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  
  // State hooks - always called in same order
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [productRatings, setProductRatings] = useState({});
  const [reviewCounts, setReviewCounts] = useState({});
  
  // Refs hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchScale = useRef(new Animated.Value(1)).current;
  const voicePulse = useRef(new Animated.Value(1)).current;

  // Theme colors - computed after hooks
  const colors = useMemo(() => ({
    background: isDarkMode ? "#121212" : "#F8F9FA",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#333333",
    textSecondary: isDarkMode ? "#AAAAAA" : "#666666",
    textLight: isDarkMode ? "#888888" : "#999999",
    border: isDarkMode ? "#333333" : "#F0F0F0",
    primary: "#c1a37f",
    primaryDark: "#a88963",
    success: "#4CAF50",
    error: "#FF6B6B",
    inputBg: isDarkMode ? "#2C2C2C" : "#F5F5F5",
    iconBg: isDarkMode ? "#2C2C2C" : "#F5F5F5",
    shadow: isDarkMode ? "#000000" : "#000000",
  }), [isDarkMode]);

  // Animation effects
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

  // Voice setup effect
  useEffect(() => {
    const onSpeechStart = () => {
      setIsListening(true);
      animateVoicePulse();
    };
    
    const onSpeechEnd = () => setIsListening(false);
    
    const onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        setSearchQuery(event.value[0]);
      }
    };
    
    const onSpeechError = () => {
      setIsListening(false);
      Toast.show({
        type: "error",
        text1: "Voice Search",
        text2: "Could not recognize speech. Please try again.",
        position: "top",
      });
    };

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const animateVoicePulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(voicePulse, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(voicePulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [voicePulse]);

  const startVoiceSearch = useCallback(async () => {
    try {
      await Voice.start("en-IN");
    } catch (e) {
      console.log("Voice error", e);
    }
  }, []);

  const stopVoiceSearch = useCallback(async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      voicePulse.setValue(1);
    } catch (e) {
      console.log("Stop error", e);
    }
  }, [voicePulse]);

  // Fetch products effect
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/subcategories?refresh=${Date.now()}`);
        if (response.data && Array.isArray(response.data)) {
          const formatted = response.data.map((item) => {
            let imageUrl = null;
            
            if (item.image_1 && item.image_1 !== "null" && item.image_1 !== "") {
              imageUrl = item.image_1.startsWith('http') ? item.image_1 : `${API_URL}${item.image_1}`;
            } else if (item.media && Array.isArray(item.media) && item.media.length > 0) {
              const firstMedia = item.media[0];
              imageUrl = firstMedia.startsWith('http') ? firstMedia : `${API_URL}${firstMedia}`;
            } else if (item.image && item.image !== "null" && item.image !== "") {
              imageUrl = item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`;
            }
            
            return {
              raw: item,
              id: item.id.toString(),
              name: item.subCategaryname || item.productName || "Product",
              price: `₹${item.price || "0"}`,
              imageUri: imageUrl,
              category: item.productCategory,
              description: item.description,
              media: item.media || [],
              image_1: item.image_1,
              image_2: item.image_2,
            };
          });
          setProducts(formatted);
          formatted.forEach((product) => {
            if (product.id) fetchProductRatings(product.id);
          });
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Failed to load products. Please check your connection.",
          position: "top",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const fetchProductRatings = useCallback(async (productId) => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews/reviews/${productId}`);
      if (res.data.success) {
        const reviews = res.data.reviews;
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
        setProductRatings((prev) => ({ ...prev, [productId]: avg }));
        setReviewCounts((prev) => ({ ...prev, [productId]: reviews.length }));
      }
    } catch (error) {
      console.log("Rating fetch error:", error);
    }
  }, []);

  // Profile load effect
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        if (!token || !storedUser) {
          setProfile(null);
          return;
        }
        const user = JSON.parse(storedUser);
        const profilePath = user?.profile;
        const imageUrl = profilePath
          ? profilePath.startsWith("http")
            ? `${profilePath}?t=${Date.now()}`
            : `${API_URL}${profilePath}?t=${Date.now()}`
          : null;
        setProfile(imageUrl);
      } catch (err) {
        console.log("Profile load error:", err);
        setProfile(null);
      }
    };
    if (isFocused) loadProfile();
  }, [isFocused]);

  const handleProfilePress = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) navigation.navigate("Login");
      else navigation.navigate("Profile");
    } catch (err) { console.log("Profile press error:", err); }
  }, [navigation]);

  // Favorites load effect
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedList = await AsyncStorage.getItem("wishlist");
        if (savedList) {
          const parsed = JSON.parse(savedList);
          setFavorites(parsed.map((item) => item.id));
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error("Wishlist load error:", err);
      }
    };
    if (isFocused) loadFavorites();
  }, [isFocused]);

  // Socket effect
  useEffect(() => {
    const socket = io(`${API_URL}`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("subCategoryUpdated", (payload) => {
      dispatch(updateCartPrices([{ id: String(payload.id), price: payload.price }]));
      const newNotification = {
        id: Date.now().toString(),
        message: `${payload.subCategaryname} price updated to ₹${payload.price}`,
        time: new Date().toLocaleTimeString(),
      };
      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        AsyncStorage.setItem("notifications", JSON.stringify(updated));
        return updated;
      });
      setUnreadCount((prev) => prev + 1);
      Toast.show({
        type: "info",
        text1: "Price Updated",
        text2: `${payload.subCategaryname} is now ₹${payload.price}`,
        position: "top",
      });
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id === String(payload.id)) {
            let newImage = item.imageUri;
            if (payload.image_1 && payload.image_1 !== "null") {
              newImage = payload.image_1.startsWith('http') ? payload.image_1 : `${API_URL}${payload.image_1}`;
            }
            return {
              ...item,
              raw: { ...item.raw, ...payload },
              name: payload.subCategaryname || item.name,
              price: `₹${payload.price ?? parseFloat(item.price.replace(/[₹,]/g, ""))}`,
              imageUri: newImage,
            };
          }
          return item;
        })
      );
    });

    socket.on("productCreated", (payload) => {
      let imageUrl = null;
      if (payload.image_1 && payload.image_1 !== "null") {
        imageUrl = payload.image_1.startsWith('http') ? payload.image_1 : `${API_URL}${payload.image_1}`;
      } else if (payload.media && payload.media.length > 0) {
        imageUrl = payload.media[0].startsWith('http') ? payload.media[0] : `${API_URL}${payload.media[0]}`;
      }
      
      const newItem = {
        raw: payload,
        id: String(payload.id),
        name: payload.subCategaryname || "Product",
        price: `₹${payload.price || "0"}`,
        imageUri: imageUrl,
        category: payload.productCategory,
      };
      setProducts((prev) => [newItem, ...prev]);
      Toast.show({
        type: "success",
        text1: "New Product",
        text2: `${newItem.name} added to store!`,
        position: "top",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  // Notifications load effect
  useEffect(() => {
    const loadNotifications = async () => {
      const saved = await AsyncStorage.getItem("notifications");
      if (saved) setNotifications(JSON.parse(saved));
    };
    if (isFocused) loadNotifications();
  }, [isFocused]);

  // Route param effect
  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  const handleShare = useCallback((item) => {
    const cleanName = item.name.replace(/Regular price/gi, "").replace(/Sale price/gi, "").trim();
    const playStoreLink = "https://play.google.com/store/apps/details?id=com.aspirebrand";
    const shareMessage = `✨ Check out this beautiful piece! ✨\n\n${cleanName}\nPrice: ${item.price}\n\nDownload the Aspire Brand App to explore more:\n${playStoreLink}`;
    Share.open({
      title: "Share Product",
      message: shareMessage,
    }).catch((err) => console.log("Share error:", err));
  }, []);

  const toggleFavorite = useCallback(async (product) => {
    try {
      const existing = await AsyncStorage.getItem("wishlist");
      let wishlist = existing ? JSON.parse(existing) : [];
      const isFav = wishlist.some((item) => item.id === product.id);
      if (isFav) {
        wishlist = wishlist.filter((item) => item.id !== product.id);
        Toast.show({ type: "info", text1: "Removed", text2: `${product.name} removed from wishlist.`, position: "bottom" });
      } else {
        wishlist.push({
          id: product.id,
          title: product.name,
          price: product.price.replace(/[₹,]/g, ""),
          image: product.imageUri,
        });
        Toast.show({ type: "success", text1: "Added", text2: `${product.name} added to wishlist.`, position: "bottom" });
      }
      await AsyncStorage.setItem("wishlist", JSON.stringify(wishlist));
      setFavorites(wishlist.map((item) => item.id));
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = useCallback(async (item) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
        return;
      }
      const numericPrice = parseFloat(item.price.replace(/[₹,]/g, ""));
      await axios.post(
        `${API_URL}/api/cart/add`,
        { productId: item.id, price: numericPrice, quantity: 1, image: item.imageUri },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({
        type: "success",
        text1: "Added to Cart ✨",
        text2: `${item.name} added successfully`,
        position: "bottom",
      });
    } catch (error) {
      console.log("Add to cart error:", error.response?.data || error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add to cart. Please try again.",
        position: "bottom",
      });
    }
  }, [navigation]);

  const renderStars = useCallback((productId, reviewCount) => {
    const actualRating = productRatings[productId] || 0;
     // Ensure rating is at least 4 if no reviews
  const displayRating = actualRating < 4 && reviewCount === 0 ? 4 : actualRating;
  // Ensure review count is at least 1 if no reviews
  const displayCount = reviewCount === 0 ? 1 : reviewCount;
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = displayRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesome key={`full-${i}`} name="star" size={12} color="#FFD700" />
        ))}
        {hasHalfStar && <FontAwesome name="star-half-full" size={12} color="#FFD700" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesome key={`empty-${i}`} name="star-o" size={12} color="#ccc" />
        ))}
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
          {displayRating.toFixed(1)} ({displayCount })
        </Text>
      </View>
    );
  }, [productRatings, colors.textSecondary]);

  const renderProductCard = useCallback(({ item }) => {
    const reviewCount = reviewCounts[item.id] || 0;

    return (
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.iconColumn}>
          <TouchableOpacity onPress={() => toggleFavorite(item)} style={[styles.iconButton, { backgroundColor: colors.iconBg }]}>
            <FontAwesome5
              name="heart"
              solid={favorites.includes(item.id)}
              size={18}
              color={favorites.includes(item.id) ? colors.error : colors.textLight}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare(item)} style={[styles.iconButton, { backgroundColor: colors.iconBg }]}>
            <FontAwesome5 name="share-alt" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
        >
          <Image
            source={item.imageUri ? { uri: item.imageUri } : Jewellerybox}
            style={styles.image}
            resizeMode="cover"
            onError={(e) => {
              console.log("Image load error for product:", item.id, e.nativeEvent.error);
            }}
          />
        </TouchableOpacity>

        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {item.price}
        </Text>
        {renderStars(item.id, reviewCount)}

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.addToCartBtn, { backgroundColor: colors.primary }]} 
            onPress={() => handleAddToCart(item)}
          >
            <MaterialIcons name="shopping-cart" size={16} color="#FFF" />
            <Text style={styles.buttonText}>Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buyNowBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              const priceValue = parseFloat(item.price.replace(/[₹,]/g, ""));
              navigation.navigate("DeliveryAddress", {
                items: [{ ...item, qty: 1, price: priceValue }],
                total: priceValue,
              });
            }}
          >
            <MaterialIcons name="flash-on" size={16} color="#FFF" />
            <Text style={styles.buttonText}>Buy</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }, [colors, favorites, fadeAnim, slideAnim, toggleFavorite, handleShare, handleAddToCart, renderStars, reviewCounts, navigation]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading exquisite jewelry...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <Animated.View style={[styles.topContainer, { backgroundColor: colors.card, borderBottomColor: colors.border, opacity: fadeAnim }]}>
        <View style={styles.headerRow}>
          <Image source={Aspirelogo} style={styles.logo} />
          <Text style={[styles.header, { color: colors.text }]}>Aspire Brand Store</Text>
        </View>

        <View style={styles.searchRow}>
          <Animated.View style={[styles.searchWrapper, { backgroundColor: colors.inputBg, transform: [{ scale: searchScale }] }]}>
            <MaterialIcons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              placeholder="Search jewelry..."
              placeholderTextColor={colors.textLight}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialIcons name="close" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </Animated.View>

          <TouchableOpacity style={[styles.micIcon, { backgroundColor: colors.inputBg }]} onPress={isListening ? stopVoiceSearch : startVoiceSearch}>
            <FontAwesome name={isListening ? "microphone-slash" : "microphone"} size={20} color={isListening ? colors.error : colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.iconContainer, { backgroundColor: colors.inputBg }]}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("NotificationsScreen", {
                  notifications,
                  resetUnread: () => setUnreadCount(0),
                })
              }
            >
              <FontAwesome5 name="bell" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={handleProfilePress} style={[styles.profileIcon, { backgroundColor: colors.inputBg }]}>
            {profile ? (
              <Image source={{ uri: profile }} style={styles.avatar} />
            ) : (
              <FontAwesome5 name="user-circle" size={24} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {isListening && (
          <Animated.View style={[styles.voiceOverlay, { transform: [{ scale: voicePulse }] }]}>
            <View style={[styles.voiceBox, { backgroundColor: colors.card }]}>
              <FontAwesome name="microphone" size={40} color={colors.error} />
              <Text style={[styles.voiceText, { color: colors.text }]}>Listening...</Text>
              <Text style={[styles.voiceSubText, { color: colors.textSecondary }]}>Speak now</Text>
            </View>
          </Animated.View>
        )}
      </Animated.View>

      <HomeCategories
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory((prev) => (prev === cat ? null : cat))}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.slidesContainer}>
            <Slides />
          </View>
        }
        renderItem={renderProductCard}
        contentContainerStyle={styles.productList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  topContainer: {
    paddingTop: Platform.OS === "ios" ? 0 : 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  micIcon: {
    marginLeft: 8,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  iconContainer: {
    marginLeft: 8,
    position: "relative",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  profileIcon: {
    marginLeft: 8,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  badge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: "#FF6B6B",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  voiceOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  voiceBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  voiceText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  voiceSubText: {
    marginTop: 4,
    fontSize: 12,
  },
  slidesContainer: {
    marginBottom: 8,
  },
  productList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    margin: 6,
    padding: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconColumn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 3,
  },
  iconButton: {
    marginBottom: 8,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: width * 0.35,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  buyNowBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});