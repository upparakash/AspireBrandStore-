import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Dimensions,
  PixelRatio,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Provider, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import store, { RootState } from "./src/redux/store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SplashScreen from "./src/screens/SplashScreen";
import HomeScreen from "./src/screens/HomeScreen";
import OffersScreen from "./src/screens/OffersScreen";
import MyCartScreen from "./src/screens/MyCartScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CategoryScreen from "./src/screens/CategoryScreen";
import DeliveryAddressScreen from "./src/screens/DeliveryAddressScreen";
import OrderHistoryScreen from "./src/screens/OrderHistoryScreen";
import ProductDetailsScreen from "./src/screens/ProductDetailsScreen";
import RegisterScreen from './src/screens/RegisterScreen';
import Login from './src/screens/Login';
import Wishlist from './src/screens/Wishlist';
import { GestureHandlerRootView } from "react-native-gesture-handler"; //  ADD THIS
import EditProfileScreen from './src/screens/EditProfileScreen'
import NotificationsScreen from './src/screens/NotificationsScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ReturnRefundPolicyScreen from './src/screens/ReturnRefundPolicyScreen';
import PrivacyPolicy from './src/screens/PrivacyPolicy';
import TermsConditions from './src/screens/TermsConditions';
import PaymentStatusScreen from './src/screens/PaymentStatusScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import ShippingPolicyScreen from './src/screens/ShippingPolicyScreen';
import TryOnScreen from './src/screens/TryOnScreen';
//  Responsive scaling utility
const { width, height } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * scale));
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

//  BOTTOM TABS
function BottomTabs(): React.ReactElement {
  const insets = useSafeAreaInsets();   // ← detect bottom safe area
  const cartCount = useSelector((state: RootState) => state.cart?.items?.length || 0);

  const CartIcon = ({ color }: { color: string }) => (
    <View style={styles.iconContainer}>
      <FontAwesome5 name="shopping-cart" size={normalize(20)} color={color} />
      {cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartCount > 99 ? "99+" : cartCount}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }): BottomTabNavigationOptions => ({
        headerShown: false,

        tabBarIcon: ({ color }) => {
          let iconName: string | undefined;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Offers") iconName = "tags";
          else if (route.name === "Profile") iconName = "user";
          else if (route.name === "Category") iconName = "th-list";

          if (route.name === "MyCart") return <CartIcon color={color} />;

          return (
            <FontAwesome5
              name={iconName!}
              size={normalize(20)}
              color={color}
            />
          );
        },

        //  Icon colors
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#970c10", // same color for all icons (change if needed)

        tabBarShowLabel: false,

        //  Tab bar background color
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: "#c1a37f",
          height: 60,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          borderRadius: width * 0.08,
          marginHorizontal: width * 0.01,
          marginBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="MyCart" component={MyCartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} />
    </Tab.Navigator>

  );
}

//  MAIN APP NAVIGATION
export default function App(): React.ReactElement {
  const isDarkMode = useColorScheme() === "dark";
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isSplashVisible ? (
                <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: "fade" }} />
              ) : (
                <>
                  <Stack.Screen name="Main" component={BottomTabs} />
                  {/*  ProductDetails is here so it opens without Tab Bar */}
                  <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
                  <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} />
                  <Stack.Screen name="DeliveryAddress" component={DeliveryAddressScreen} />
                  <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                  <Stack.Screen name="Login" component={Login} />
                  <Stack.Screen name="WishlistScreen" component={Wishlist} options={{ title: 'Wishlist' }} />
                  <Stack.Screen name="OrderDetailsScreen" component={OrderDetailsScreen} />
                  <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                  <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
                  <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
                  <Stack.Screen name="ShippingPolicyScreen" component={ShippingPolicyScreen} />
                  <Stack.Screen name="PaymentStatusScreen" component={PaymentStatusScreen} />
                  <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
                  <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen}/>
                   <Stack.Screen name="TryOnScreen" component={TryOnScreen}/>
                  <Stack.Screen
                    name="ReturnRefundPolicy"
                    component={ReturnRefundPolicyScreen}
                    options={{ title: "Return & Refund Policy" }}
                  />
                  <Stack.Screen
                    name="PrivacyPolicy"
                    component={PrivacyPolicy}
                    options={{ title: "Privacy Policy" }}
                  />
                  <Stack.Screen
                    name="TermsConditions"
                    component={TermsConditions}
                    options={{ title: "Terms & Conditions" }}
                  />

                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </SafeAreaProvider>
      </GestureHandlerRootView>
      {/*  FIX END */}
    </Provider>
  );
}

//  Styles
const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: "#fff",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: normalize(-6),
    top: normalize(-4),
    backgroundColor: "#ff4444",
    borderRadius: normalize(10),
    minWidth: normalize(16),
    height: normalize(16),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: normalize(3),
  },
  badgeText: {
    color: "white",
    fontSize: normalize(9),
    fontWeight: "bold",
  },
});
