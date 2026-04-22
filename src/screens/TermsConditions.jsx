import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get("window");

const TermsConditions = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
  }, [colorScheme]);

  const colors = {
    background: isDarkMode ? "#0a0a0a" : "#f8fafc",
    surface: isDarkMode ? "#1a1a1a" : "#ffffff",
    card: isDarkMode ? "#2a2a2a" : "#ffffff",
    text: isDarkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: isDarkMode ? "#94a3b8" : "#475569",
    textTertiary: isDarkMode ? "#64748b" : "#64748b",
    accent: "#6366f1",
    accentLight: isDarkMode ? "#818cf8" : "#6366f1",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    highlight: isDarkMode ? "#334155" : "#f1f5f9",
    warning: "#f59e0b",
    error: "#ef4444",
    success: "#10b981",
    link: "#3b82f6",
  };

  const handleLinkPress = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const Section = ({ title, children, icon, iconColor = colors.accent }) => (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {title && (
        <View style={styles.sectionHeader}>
          {icon && <Icon name={icon} size={24} color={iconColor} style={styles.sectionIcon} />}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
      )}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const BulletPoint = ({ text, type = "default" }) => {
    const getBulletColor = () => {
      switch (type) {
        case "warning":
          return colors.warning;
        case "error":
          return colors.error;
        case "success":
          return colors.success;
        default:
          return colors.accent;
      }
    };

    return (
      <View style={styles.bulletPoint}>
        <Icon name="ellipse" size={6} color={getBulletColor()} style={styles.bulletDot} />
        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{text}</Text>
      </View>
    );
  };

  const InfoCard = ({ title, content, type = "info" }) => {
    const cardColors = {
      info: { bg: isDarkMode ? "#1e293b" : "#eef2ff", text: colors.accent, icon: "information-circle" },
      warning: { bg: isDarkMode ? "#3b2e1e" : "#fffbeb", text: colors.warning, icon: "alert-triangle" },
      error: { bg: isDarkMode ? "#3b1e1e" : "#fef2f2", text: colors.error, icon: "alert-circle" },
      success: { bg: isDarkMode ? "#1e3a2e" : "#f0fdf4", text: colors.success, icon: "checkmark-circle" },
    };
    const cardColor = cardColors[type];

    return (
      <View style={[styles.infoCard, { backgroundColor: cardColor.bg }]}>
        <View style={styles.infoCardHeader}>
          <Icon name={cardColor.icon} size={20} color={cardColor.text} />
          <Text style={[styles.infoCardTitle, { color: cardColor.text }]}>{title}</Text>
        </View>
        <Text style={[styles.infoCardContent, { color: colors.textSecondary }]}>{content}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header with Back Button */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroBadge, { backgroundColor: `${colors.accent}15` }]}>
            <Icon name="document-text-outline" size={14} color={colors.accent} style={styles.heroBadgeIcon} />
            <Text style={[styles.heroBadgeText, { color: colors.accent }]}>Legal Agreement</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Terms & Conditions</Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>Effective Date: 01-Jan-2026</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Welcome to ASPIRE ENTERPRISES! By accessing or using our website
            www.aspirebrand.store or making a purchase, you agree to comply with
            the following Terms and Conditions. Please read them carefully.
          </Text>
        </View>

        {/* 1. General Overview */}
        <Section title="General Overview" icon="globe-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            These Terms & Conditions govern your access to and use of Aspire
            Store's website and services. By using our platform, you agree to
            follow all applicable laws and these terms.
          </Text>
        </Section>

        {/* 2. Account Registration */}
        <Section title="Account Registration" icon="person-outline">
          <BulletPoint text="You may need to create an account to access certain features." />
          <BulletPoint text="Keep your login credentials secure and confidential." />
          <BulletPoint text="You are responsible for all activity under your account." />
          <BulletPoint text="We reserve the right to suspend or terminate accounts that violate our terms." />
          <InfoCard
            title="Security Tip"
            content="Always use a strong password and never share your login credentials with anyone."
            type="info"
          />
        </Section>

        {/* 3. Product Information & Pricing */}
        <Section title="Product Information & Pricing" icon="pricetag-outline">
          <BulletPoint text="We strive to display accurate product descriptions and images." />
          <BulletPoint text="Prices are listed in applicable currency and may change without prior notice." />
          <BulletPoint text="We reserve the right to modify or discontinue products at any time." />
          <InfoCard
            title="Note"
            content="Product images are for illustration purposes only. Actual products may vary slightly."
            type="info"
          />
        </Section>

        {/* 4. Orders & Payments */}
        <Section title="Orders & Payments" icon="card-outline">
          <BulletPoint text="All orders are subject to availability and confirmation." />
          <BulletPoint text="Payments are processed via secure third-party gateways. We do not store card details." />
          <BulletPoint text="Aspire Store may cancel orders due to payment issues, stock unavailability, or suspected fraud." />
          <View style={styles.securityBadge}>
            <Icon name="shield-checkmark-outline" size={16} color={colors.success} />
            <Text style={[styles.securityText, { color: colors.success }]}>100% Secure Payment Processing</Text>
          </View>
        </Section>

        {/* 5. Shipping & Delivery */}
        <Section title="Shipping & Delivery" icon="car-outline">
          <BulletPoint text="Delivery timelines vary by location and shipping method (typically 3–5 business days)." />
          <BulletPoint text="Delays caused by couriers, weather, or external factors are beyond our control." />
          <BulletPoint text="Shipping fees, if applicable, are shown at checkout." />
        </Section>

        {/* 6. Promotions & Discounts */}
        <Section title="Promotions & Discounts" icon="gift-outline">
          <BulletPoint text="Offers may change or expire without prior notice." />
          <BulletPoint text="Discounts cannot be combined unless explicitly stated." />
          <InfoCard
            title="Limited Time Offers"
            content="Subscribe to our newsletter to stay updated on the latest promotions and exclusive discounts."
            type="success"
          />
        </Section>

        {/* 7. User Conduct */}
        <Section title="User Conduct" icon="alert-circle-outline">
          <BulletPoint text="Do not use the site for illegal or unauthorized purposes." type="warning" />
          <BulletPoint text="Do not interfere with site security or functionality." type="warning" />
          <BulletPoint text="Do not upload harmful, abusive, or misleading content." type="warning" />
        </Section>

        {/* 8. Intellectual Property */}
        <Section title="Intellectual Property" icon="copyright-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            All content on Aspire Store—including logos, images, designs, and
            product descriptions—is the property of Aspire Store and protected by
            copyright laws. Unauthorized use is prohibited.
          </Text>
        </Section>

        {/* 9. Limitation of Liability */}
        <Section title="Limitation of Liability" icon="warning-outline">
          <BulletPoint text="Indirect or incidental damages from site usage." type="error" />
          <BulletPoint text="Losses due to delayed shipments or product availability." type="error" />
          <BulletPoint text="Minor inaccuracies in product images or descriptions." type="error" />
        </Section>

        {/* 10. Governing Law */}
        <Section title="Governing Law" icon="business-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            These terms are governed by applicable laws. Any disputes will be
            handled in the appropriate jurisdiction of Telangana.
          </Text>
        </Section>

        {/* 11. Changes to These Terms */}
        <Section title="Changes to These Terms" icon="create-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We may update these Terms & Conditions at any time. Continued use of
            our website signifies acceptance of the revised terms.
          </Text>
        </Section>

        {/* Contact Us Section */}
        <Section title="Contact Us" icon="call-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 16 }]}>
            If you have any questions about these Terms & Conditions, please contact us:
          </Text>
          
          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.highlight }]}
            onPress={() => handleLinkPress('mailto:support@aspirebrand.store')}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Icon name="mail-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textTertiary }]}>Email</Text>
              <Text style={[styles.contactValue, { color: colors.link }]}>support@aspirebrand.store</Text>
            </View>
            <Icon name="open-outline" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.highlight, marginTop: 8 }]}
            onPress={() => handleLinkPress('https://www.aspirebrand.store')}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Icon name="globe-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textTertiary }]}>Website</Text>
              <Text style={[styles.contactValue, { color: colors.link }]}>www.aspirebrand.store</Text>
            </View>
            <Icon name="open-outline" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.highlight, marginTop: 8 }]}
            onPress={() => handleLinkPress('tel:04045195642')}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Icon name="call-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textTertiary }]}>Landline</Text>
              <Text style={[styles.contactValue, { color: colors.link }]}>040-45195642</Text>
            </View>
            <Icon name="open-outline" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </Section>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Icon name="checkmark-done-outline" size={20} color={colors.accent} style={styles.footerIcon} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            By using our services, you agree to these Terms & Conditions.
            Thank you for choosing ASPIRE ENTERPRISES.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgeIcon: {
    marginRight: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: width > 600 ? 36 : 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: 50,
    marginVertical: 16,
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionContent: {
    padding: 20,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 8,
  },
  bulletDot: {
    marginTop: 7,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },
  infoCardContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(16,185,129,0.1)",
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  contactIconContainer: {
    width: 40,
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    alignItems: "center",
  },
  footerIcon: {
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default TermsConditions;