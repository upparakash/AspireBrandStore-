import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  PixelRatio,
  Animated,
  StatusBar,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "@env";
import { useIsFocused } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function MyCartScreen() {
  // Theme and navigation hooks
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  
  // State hooks
  const [token, setToken] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const swipeableRefs = useRef({}).current;
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
    error: "#E53935",
    iconBg: isDarkMode ? "#2C2C2C" : "#F5F5F5",
  }), [isDarkMode]);

  // Helper function to get or create animation for an item
  const getItemAnimation = useCallback((itemId) => {
    if (!itemAnimations[itemId]) {
      itemAnimations[itemId] = {
        translateY: new Animated.Value(50),
        opacity: new Animated.Value(0),
      };
      Animated.parallel([
        Animated.timing(itemAnimations[itemId].translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(itemAnimations[itemId].opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
    return itemAnimations[itemId];
  }, [itemAnimations]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("token");
      setToken(t);
    };
    loadToken();
  }, []);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(response.data)) {
        setCartItems([]);
        return;
      }

      const formatted = response.data.map((item) => ({
        id: item.productId,
        name: item.name,
        imageUri: item.img || null,
        price: Number(item.price),
        qty: item.qty,
      }));

      setCartItems(formatted);
      setSelectedIds(prev => prev.filter(id =>
        formatted.some(item => item.id === id)
      ));
    } catch (error) {
      console.log("Cart fetch error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load cart items");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && isFocused) {
      fetchCart();
    }
  }, [token, isFocused, fetchCart]);

  const updateQuantity = useCallback(async (productId, type) => {
    try {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? {
                ...item,
                qty: type === "increment" ? item.qty + 1 : Math.max(1, item.qty - 1)
              }
            : item
        )
      );

      await axios.put(
        `${API_URL}/api/cart/update`,
        { productId, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log("Qty update error:", error.response?.data || error.message);
      fetchCart();
      Alert.alert("Error", "Failed to update quantity");
    }
  }, [token, fetchCart]);

  const removeItem = useCallback(async (productId) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/cart/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setCartItems(prev => prev.filter(item => item.id !== productId));
              setSelectedIds(prev => prev.filter(id => id !== productId));
              delete itemAnimations[productId];
              delete swipeableRefs[productId];
            } catch (error) {
              console.log("Remove error:", error.response?.data || error.message);
              Alert.alert("Error", "Failed to remove item");
            }
          },
        },
      ]
    );
  }, [token, itemAnimations, swipeableRefs]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item.id));
    }
  }, [selectedIds.length, cartItems]);

  const selectedItems = useMemo(() => 
    cartItems.filter((item) => selectedIds.includes(item.id)),
    [cartItems, selectedIds]
  );
  
  const selectedTotal = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [selectedItems]
  );
  
  const selectedItemsCount = selectedItems.length;

  const handleCheckout = useCallback(() => {
    if (selectedItemsCount === 0) {
      Alert.alert("No Items Selected", "Please select at least one product to proceed.");
      return;
    }
    navigation.navigate("DeliveryAddress", {
      items: selectedItems,
      total: selectedTotal,
      selectedIds: selectedIds,
    });
  }, [selectedItemsCount, selectedItems, selectedTotal, selectedIds, navigation]);

  const closeAllSwipeables = useCallback(() => {
    Object.values(swipeableRefs).forEach(ref => {
      if (ref?.close) ref.close();
    });
  }, [swipeableRefs]);

  const renderRightActions = useCallback((item) => {
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.error }]}
        onPress={() => removeItem(item.id)}
      >
        <Icon name="delete" size={24} color="#FFFFFF" />
        <Text style={styles.deleteText}>Remove</Text>
      </TouchableOpacity>
    );
  }, [colors.error, removeItem]);

  const renderItem = useCallback(({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    const itemTotal = item.price * item.qty;
    const animation = getItemAnimation(item.id);

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: animation.opacity,
            transform: [{ translateY: animation.translateY }],
          },
        ]}
      >
        <Swipeable
          ref={(ref) => { if (ref) swipeableRefs[item.id] = ref; }}
          renderRightActions={() => renderRightActions(item)}
          overshootRight={false}
          rightThreshold={40}
          onSwipeableOpen={() => {
            Object.keys(swipeableRefs).forEach(id => {
              if (id !== item.id && swipeableRefs[id]?.close) {
                swipeableRefs[id].close();
              }
            });
          }}
        >
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.checkbox, isSelected && styles.checked]}
              onPress={() => toggleSelect(item.id)}
            >
              {isSelected && <Icon name="check" size={16} color="#FFFFFF" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contentContainer}
              onPress={() => {
                closeAllSwipeables();
                navigation.navigate("ProductDetails", { productId: item.id });
              }}
              activeOpacity={0.9}
            >
              <Image
                source={item.imageUri ? { uri: item.imageUri } : require("../images/Jewellerybox.png")}
                style={styles.image}
              />

              <View style={styles.itemDetails}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.price, { color: colors.primary }]}>
                  ₹{item.price.toFixed(2)}
                </Text>
                
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.iconBg }]}
                    onPress={() => updateQuantity(item.id, "decrement")}
                  >
                    <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={[styles.qty, { color: colors.text }]}>{item.qty}</Text>
                  
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.iconBg }]}
                    onPress={() => updateQuantity(item.id, "increment")}
                  >
                    <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
                  </TouchableOpacity>
                  
                  <Text style={[styles.itemTotal, { color: colors.primary }]}>
                    ₹{itemTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Swipeable>
      </Animated.View>
    );
  }, [selectedIds, colors, toggleSelect, navigation, updateQuantity, getItemAnimation, renderRightActions, closeAllSwipeables, swipeableRefs]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Icon name="shopping-cart" size={80} color={colors.textLight} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty</Text>
        <Text style={[styles.emptySubText, { color: colors.textLight }]}>Add some beautiful jewelry to get started</Text>
        <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>My Cart</Text>
            <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
              ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={selectAll} style={styles.selectAllBtn}>
              <Text style={[styles.selectAllText, { color: colors.primary }]}>
                {selectedIds.length === cartItems.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: tabBarHeight + normalize(140),
            paddingHorizontal: normalize(14),
          }}
          renderItem={renderItem}
          onScrollBeginDrag={closeAllSwipeables}
        />

        {selectedItemsCount > 0 && (
          <Animated.View style={[styles.bottomBar, { backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, normalize(14)) }]}>
            <View style={styles.totalRow}>
              <View>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Selected Items</Text>
                <Text style={[styles.selectedCount, { color: colors.primary }]}>
                  {selectedItemsCount} {selectedItemsCount === 1 ? 'item' : 'items'}
                </Text>
              </View>
              <View style={styles.totalAmountContainer}>
                <Text style={[styles.totalAmountLabel, { color: colors.textSecondary }]}>Total Amount</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{selectedTotal.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: colors.primary }]} onPress={handleCheckout} activeOpacity={0.8}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Icon name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: normalize(20) },
  loadingText: { marginTop: normalize(12), fontSize: normalize(14), fontWeight: "500" },
  emptyText: { fontSize: normalize(18), fontWeight: "600", marginTop: normalize(16) },
  emptySubText: { fontSize: normalize(14), marginTop: normalize(8), textAlign: "center" },
  continueBtn: { marginTop: normalize(24), paddingVertical: normalize(12), paddingHorizontal: normalize(24), borderRadius: normalize(25) },
  continueBtnText: { fontSize: normalize(14), fontWeight: "600", color: "#FFFFFF" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: normalize(14), paddingVertical: normalize(14), borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: normalize(12), padding: normalize(4) },
  title: { fontSize: normalize(22), fontWeight: "700" },
  itemCount: { fontSize: normalize(14), marginLeft: normalize(8) },
  headerRight: { flexDirection: "row", alignItems: "center" },
  selectAllBtn: { marginRight: normalize(16) },
  selectAllText: { fontSize: normalize(14), fontWeight: "600" },
  cardWrapper: { marginBottom: normalize(12) },
  card: { flexDirection: "row", alignItems: "center", padding: normalize(12), borderRadius: normalize(16), shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  checkbox: { width: normalize(24), height: normalize(24), borderRadius: normalize(12), borderWidth: 2, borderColor: "#D4AF37", marginRight: normalize(12), justifyContent: "center", alignItems: "center" },
  checked: { backgroundColor: "#D4AF37" },
  contentContainer: { flex: 1, flexDirection: "row" },
  image: { width: normalize(80), height: normalize(80), borderRadius: normalize(12), marginRight: normalize(12), backgroundColor: "#F5F5F5" },
  itemDetails: { flex: 1, justifyContent: "space-between" },
  name: { fontSize: normalize(14), fontWeight: "600", marginBottom: normalize(4), lineHeight: normalize(20) },
  price: { fontSize: normalize(16), fontWeight: "700", marginBottom: normalize(8) },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { width: normalize(32), height: normalize(32), borderRadius: normalize(8), justifyContent: "center", alignItems: "center" },
  qtyBtnText: { fontSize: normalize(18), fontWeight: "600" },
  qty: { marginHorizontal: normalize(12), fontSize: normalize(15), fontWeight: "600", minWidth: normalize(30), textAlign: "center" },
  itemTotal: { marginLeft: normalize(12), fontSize: normalize(14), fontWeight: "600" },
  deleteAction: { justifyContent: "center", alignItems: "center", width: normalize(80), borderRadius: normalize(12), marginLeft: normalize(8) },
  deleteText: { color: "#FFFFFF", fontSize: normalize(12), fontWeight: "600", marginTop: normalize(4) },
  bottomBar: { position: "absolute", left: normalize(14), right: normalize(14), bottom: normalize(70), paddingVertical: normalize(16), paddingHorizontal: normalize(20), borderRadius: normalize(20), shadowOpacity: 0.1, shadowOffset: { width: 0, height: -2 }, shadowRadius: 10, elevation: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: normalize(16) },
  selectedCount: { fontSize: normalize(20), fontWeight: "700", marginTop: normalize(4) },
  totalAmountContainer: { alignItems: "flex-end" },
  totalAmountLabel: { fontSize: normalize(12), fontWeight: "500", marginBottom: normalize(4) },
  totalLabel: { fontSize: normalize(14), fontWeight: "500" },
  totalAmount: { fontSize: normalize(24), fontWeight: "700" },
  checkoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: normalize(14), borderRadius: normalize(25), gap: normalize(8) },
  checkoutText: { fontSize: normalize(16), fontWeight: "700", color: "#FFFFFF" },
});