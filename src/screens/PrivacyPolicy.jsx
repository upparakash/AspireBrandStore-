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

const PrivacyPolicy = ({ navigation }) => {
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

  const PartnerBadge = ({ name, icon }) => (
    <View style={[styles.partnerBadge, { backgroundColor: colors.highlight }]}>
      <Icon name={icon} size={16} color={colors.accent} />
      <Text style={[styles.partnerBadgeText, { color: colors.textSecondary }]}>{name}</Text>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
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
            <Icon name="lock-closed-outline" size={14} color={colors.accent} style={styles.heroBadgeIcon} />
            <Text style={[styles.heroBadgeText, { color: colors.accent }]}>Data Protection</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>Last Updated: 12/05/2025</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Welcome to ASPIRE ENTERPRISES – your go-to destination for stylish,
            quality fashion. Your privacy is important to us, and we're committed
            to be clear and transparent about how we collect, use, and protect
            your personal data.
          </Text>
        </View>

        {/* Your Privacy, Our Priority */}
        <Section title="Your Privacy, Our Priority" icon="heart-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            At Aspire Store, we only collect the information we truly need to
            deliver a seamless, secure, and personalized shopping experience. We
            never sell your data.
          </Text>
          <InfoCard
            title="Our Promise"
            content="We are committed to protecting your privacy and ensuring your personal information is handled with the utmost care and security."
            type="success"
          />
        </Section>

        {/* What We Collect */}
        <Section title="What We Collect" icon="document-outline">
          <BulletPoint text="Contact Info: Name, email, phone number, shipping/billing address" />
          <BulletPoint text="Order Info: Purchased items, payment method (securely processed), order history" />
          <BulletPoint text="Account Details: Login credentials (securely encrypted)" />
          <BulletPoint text="Device Data: IP address, browser type, location, site interactions" />
          <BulletPoint text="Marketing Preferences: Newsletter and promotional preferences" />
        </Section>

        {/* Why We Collect It */}
        <Section title="Why We Collect It" icon="analytics-outline">
          <BulletPoint text="Process orders and provide customer support" />
          <BulletPoint text="Send order updates and shipping notifications" />
          <BulletPoint text="Personalize your shopping experience" />
          <BulletPoint text="Improve our website and product offerings" />
          <BulletPoint text="Send offers and promotions (only if you opt in)" />
        </Section>

        {/* Who We Share It With */}
        <Section title="Who We Share It With" icon="people-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 12 }]}>
            We share your information with trusted partners who help us deliver our services:
          </Text>
          <View style={styles.partnerGrid}>
            <PartnerBadge name="Razorpay" icon="card-outline" />
            <PartnerBadge name="Stripe" icon="card-outline" />
            <PartnerBadge name="Courier Partners" icon="car-outline" />
            <PartnerBadge name="Email Platforms" icon="mail-outline" />
            <PartnerBadge name="Google Analytics" icon="stats-chart-outline" />
          </View>
          <InfoCard
            title="Data Protection"
            content="All partners are required to follow strict data protection standards and comply with applicable privacy laws."
            type="info"
          />
        </Section>

        {/* Cookies and Tracking */}
        <Section title="Cookies and Tracking" icon="cafe-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 12 }]}>
            We use cookies to enhance your browsing experience:
          </Text>
          <BulletPoint text="Keep you logged in" />
          <BulletPoint text="Save your shopping cart" />
          <BulletPoint text="Show relevant products" />
          <BulletPoint text="Analyze website usage" />
          <InfoCard
            title="Cookie Control"
            content="You can manage cookie settings through your browser at any time. Blocking cookies may affect some website features."
            type="warning"
          />
        </Section>

        {/* Your Rights */}
        <Section title="Your Rights" icon="shield-outline">
          <BulletPoint text="Access or update your personal information" type="success" />
          <BulletPoint text="Request a copy or deletion of your data" type="success" />
          <BulletPoint text="Unsubscribe from marketing emails anytime" type="success" />
          <BulletPoint text="Contact us at support@aspirebrand.store" type="success" />
          <InfoCard
            title="GDPR & CCPA Compliant"
            content="We respect your privacy rights and comply with applicable data protection regulations."
            type="info"
          />
        </Section>

        {/* How We Keep It Safe */}
        <Section title="How We Keep It Safe" icon="lock-closed-outline">
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Icon name="shield-checkmark-outline" size={20} color={colors.success} />
              <Text style={[styles.securityFeatureText, { color: colors.textSecondary }]}>SSL Encryption</Text>
            </View>
            <View style={styles.securityFeature}>
              <Icon name="server-outline" size={20} color={colors.success} />
              <Text style={[styles.securityFeatureText, { color: colors.textSecondary }]}>Secure Servers</Text>
            </View>
            <View style={styles.securityFeature}>
              <Icon name="key-outline" size={20} color={colors.success} />
              <Text style={[styles.securityFeatureText, { color: colors.textSecondary }]}>Restricted Access Controls</Text>
            </View>
            <View style={styles.securityFeature}>
              <Icon name="flame-outline" size={20} color={colors.success} />
              <Text style={[styles.securityFeatureText, { color: colors.textSecondary }]}>Firewall Protection</Text>
            </View>
          </View>
        </Section>

        {/* Children's Privacy */}
        <Section title="Children's Privacy" icon="people-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Our website is not intended for children under 13. If we discover such
            data, it will be deleted immediately.
          </Text>
        </Section>

        {/* Updates to This Policy */}
        <Section title="Updates to This Policy" icon="create-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We may update this policy from time to time. Any changes will be
            reflected by updating the Last Updated date on this page.
          </Text>
        </Section>

        {/* Contact Us Section */}
        <Section title="Contact Us" icon="call-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 16 }]}>
            If you have any questions about this Privacy Policy or your data, please contact us:
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
          <Icon name="shield-checkmark-outline" size={20} color={colors.accent} style={styles.footerIcon} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Your privacy matters to us. We are committed to protecting your personal information
            and being transparent about how we use it.
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
  partnerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  partnerBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  securityFeatures: {
    gap: 12,
  },
  securityFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  securityFeatureText: {
    fontSize: 14,
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

export default PrivacyPolicy;