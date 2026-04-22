import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Animated,
  StatusBar,
  useColorScheme,
  Share,
} from "react-native";
import Video from "react-native-video";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageSlider from "../components/ImageSlider";
import ImageViewing from "react-native-image-viewing";
import Toast from "react-native-toast-message";
import RenderHTML from "react-native-render-html";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import YoutubePlayer from "react-native-youtube-iframe";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

/* ===============================
   UTILITIES
================================ */

const extractYouTubeIframes = (html = "") => {
  const matches = [...html.matchAll(/<iframe[^>]+src="([^">]+)"/g)];
  return matches.map((m) => m[1]);
};

const removeMediaFigures = (html = "") =>
  html.replace(/<figure class="media">[\s\S]*?<\/figure>/g, "");

const normalizeImages = (html = "") =>
  html.replace(/<img /g, '<img style="max-width:100%;height:auto;" ');

export default function ProductDetailsScreen({ navigation }) {
  const route = useRoute();
  const { product: initialProduct, productId } = route.params || {};
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // All useState hooks at the top
  const [product, setProduct] = useState(initialProduct || null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(!initialProduct && productId ? true : false);
  const [fetchError, setFetchError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Theme colors
  const colors = {
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
    success: "#4CAF50",
    error: "#E53935",
    iconBg: isDarkMode ? "#2C2C2C" : "#F5F5F5",
    shadow: isDarkMode ? "#000000" : "#000000",
  };

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
  }, []);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const wishlist = await AsyncStorage.getItem("wishlist");
        if (wishlist) {
          const items = JSON.parse(wishlist);
          setIsInWishlist(items.some(item => item.id === product?.id?.toString()));
        }
      } catch (error) {
        console.log("Wishlist check error:", error);
      }
    };
    if (product) checkWishlist();
  }, [product]);

  useEffect(() => {
    if (!initialProduct && productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await axios.get(`${API_URL}/api/subcategories/${productId}`);

      const apiData = res.data;
      const transformedProduct = {
        id: apiData.id,
        subCategaryname: apiData.subCategaryname,
        description: apiData.description,
        price: apiData.price,
        weight: apiData.weight,
      };

      if (apiData.media && Array.isArray(apiData.media)) {
        transformedProduct.media = apiData.media.map(item => item.url);
        apiData.media.forEach((item, index) => {
          const imageKey = `image_${index + 1}`;
          transformedProduct[imageKey] = item.url;
        });
      } else {
        transformedProduct.media = [];
      }

      setProduct(transformedProduct);
    } catch (error) {
      console.log("Product fetch error:", error.response?.data || error.message);
      setFetchError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      MIXED MEDIA HANDLING
  ================================ */

  const mediaItems = useMemo(() => {
    let items = [];
    if (!product) return items;

    Object.keys(product)
      .filter((key) => key.startsWith("image_") && product[key])
      .sort((a, b) => {
        const numA = parseInt(a.split("_")[1]);
        const numB = parseInt(b.split("_")[1]);
        return numA - numB;
      })
      .forEach((key) => {
        const uri = product[key];
        items.push({ type: "image", uri });
      });

    if (product?.media && Array.isArray(product.media)) {
      product.media.forEach((uri) => {
        const exists = items.some(item => item.uri === uri);
        if (!exists) {
          items.push({ type: "image", uri });
        }
      });
    }

    if (items.length === 0) {
      items.push({
        type: "image",
        uri: Image.resolveAssetSource(
          require("../images/Jewellerybox.png")
        ).uri,
      });
    }

    return items;
  }, [product]);

  const imageItems = useMemo(() =>
    mediaItems.filter((item) => item.type === "image"),
    [mediaItems]
  );

  /* ===============================
     DESCRIPTION
  ================================ */

  const youtubeVideos = useMemo(
    () => extractYouTubeIframes(product?.description || ""),
    [product?.description]
  );

  const cleanHTML = useMemo(() => {
    let html = removeMediaFigures(product?.description || "");
    html = normalizeImages(html);
    return html || "<p>No description available</p>";
  }, [product?.description]);

  /* ===============================
     HELPER FUNCTIONS
  ================================ */

  const getYouTubeId = (url = "") => {
    const regExp =
      /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ===============================
     WISHLIST HANDLER
  ================================ */

  const toggleWishlist = async () => {
    try {
      const existing = await AsyncStorage.getItem("wishlist");
      let wishlist = existing ? JSON.parse(existing) : [];
      
      if (isInWishlist) {
        wishlist = wishlist.filter((item) => item.id !== product.id.toString());
        Toast.show({
          type: "info",
          text1: "Removed from Wishlist",
          text2: `${product.subCategaryname} removed from wishlist`,
          position: "bottom",
        });
      } else {
        wishlist.push({
          id: product.id.toString(),
          title: product.subCategaryname,
          price: product.price,
          image: imageItems[0]?.uri,
        });
        Toast.show({
          type: "success",
          text1: "Added to Wishlist",
          text2: `${product.subCategaryname} added to wishlist`,
          position: "bottom",
        });
      }
      
      await AsyncStorage.setItem("wishlist", JSON.stringify(wishlist));
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  /* ===============================
     SHARE HANDLER
  ================================ */

  const handleShare = async () => {
    try {
      await Share.share({
        title: product.subCategaryname,
        message: `Check out this beautiful piece: ${product.subCategaryname}\nPrice: ₹${product.price}\n\nDownload the Aspire Brand App to see more!`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  /* ===============================
     QUANTITY HANDLERS
  ================================ */

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
    animateButton();
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      animateButton();
    }
  };

  /* ===============================
     CART HANDLERS
  ================================ */

  const handleAddToCart = async () => {
    animateButton();
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const numericPrice = parseFloat(
        String(product.price).replace(/[₹,]/g, "")
      );

      await axios.post(
        `${API_URL}/api/cart/add`,
        {
          productId: product.id,
          price: numericPrice,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Toast.show({
        type: "success",
        text1: "Added to Cart",
        text2: `${quantity} x ${product.subCategaryname} added successfully`,
        position: "bottom",
      });
    } catch (error) {
      console.log("Add to cart error:", error.response?.data || error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add to cart",
        position: "bottom",
      });
    }
  };

  const handleBuyNow = async () => {
    animateButton();
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const numericPrice = parseFloat(product.price || "0");
      const buyNowItem = {
        id: product.id.toString(),
        name: product.subCategaryname,
        imageUri: imageItems[0]?.uri,
        qty: quantity,
        price: numericPrice,
      };

      navigation.navigate("DeliveryAddress", {
        items: [buyNowItem],
        total: numericPrice * quantity,
        isBuyNow: true,
      });
    } catch (error) {
      console.log("Buy now error:", error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading product...
        </Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{fetchError}</Text>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Show not found state
  if (!product) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <MaterialIcons name="search-off" size={64} color={colors.textLight} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Product not found</Text>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.primary, marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* HEADER */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.headerButton, { backgroundColor: colors.iconBg }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Product Details</Text>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              onPress={toggleWishlist} 
              style={[styles.headerButton, { backgroundColor: colors.iconBg, marginRight: 8 }]}
            >
              <MaterialIcons 
                name="favorite" 
                size={22} 
                color={isInWishlist ? colors.error : colors.textLight} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleShare} 
              style={[styles.headerButton, { backgroundColor: colors.iconBg }]}
            >
              <MaterialIcons name="share" size={22} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* IMAGE SLIDER */}
        {imageItems.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <ImageSlider
              images={imageItems.map((img) => img.uri)}
              onImagePress={(index) => {
                setSelectedIndex(index);
                setViewerVisible(true);
              }}
            />
          </Animated.View>
        )}

        {/* FULL SCREEN IMAGE VIEWER */}
        {imageItems.length > 0 && (
          <ImageViewing
            images={imageItems.map(img => ({ uri: img.uri }))}
            imageIndex={selectedIndex}
            visible={viewerVisible}
            onRequestClose={() => setViewerVisible(false)}
          />
        )}

        {/* PRODUCT INFO */}
        <Animated.View 
          style={[
            styles.info, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {product.subCategaryname}
            </Text>
            {product.weight && (
              <View style={[styles.weightBadge, { backgroundColor: colors.iconBg }]}>
                <Text style={[styles.weightText, { color: colors.textSecondary }]}>
                  {product.weight}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              ₹{product.price}
            </Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.iconBg }]}
                onPress={decrementQuantity}
              >
                <MaterialIcons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.iconBg }]}
                onPress={incrementQuantity}
              >
                <MaterialIcons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* DESCRIPTION SECTION */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* YOUTUBE VIDEOS */}
            {youtubeVideos.map((url, index) => {
              const videoId = getYouTubeId(url);
              if (!videoId) return null;

              return (
                <View key={index} style={styles.videoWrapper}>
                  <YoutubePlayer
                    height={220}
                    play={false}
                    videoId={videoId}
                    webViewStyle={{ borderRadius: 12 }}
                  />
                </View>
              );
            })}

            <RenderHTML
              contentWidth={width - 30}
              source={{ html: cleanHTML }}
              baseStyle={{ color: colors.text, fontSize: 14, lineHeight: 22 }}
              tagsStyles={{
                p: { marginBottom: 12 },
                strong: { color: colors.primary, fontWeight: 'bold' },
              }}
            />
          </View>

          {/* GALLERY SECTION */}
          {mediaItems.length > 1 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Gallery</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.galleryContainer}>
                {mediaItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.9}
                    onPress={() => {
                      const imgIndex = imageItems.findIndex(
                        (img) => img.uri === item.uri
                      );
                      setSelectedIndex(imgIndex >= 0 ? imgIndex : 0);
                      setViewerVisible(true);
                    }}
                    style={styles.galleryItem}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ACTION BUTTONS */}
          <Animated.View style={[styles.actionRow, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
              style={[styles.cartButton, { backgroundColor: colors.primary }]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <MaterialIcons name="shopping-cart" size={20} color="#FFFFFF" />
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buyButton, { backgroundColor: colors.accent }]}
              onPress={handleBuyNow}
              activeOpacity={0.8}
            >
              <MaterialIcons name="flash-on" size={20} color="#FFFFFF" />
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===============================
   STYLES
================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  info: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
    lineHeight: 32,
  },
  weightBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weightText: {
    fontSize: 12,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  videoWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 16,
  },
  galleryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  galleryItem: {
    width: (width - 44) / 2,
    height: (width - 44) / 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  cartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});