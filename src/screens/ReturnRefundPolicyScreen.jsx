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

const ReturnRefundPolicyScreen = ({ navigation }) => {
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

  const handleEmailPress = async () => {
    try {
      await Linking.openURL("mailto:support@aspirebrand.store");
    } catch (error) {
      console.error("Error opening email:", error);
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

  const TimelineItem = ({ step, title, description }) => (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineStep, { backgroundColor: colors.accent }]}>
        <Text style={styles.timelineStepText}>{step}</Text>
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.timelineDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Return & Refund</Text>
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
            <Icon name="return-up-back-outline" size={14} color={colors.accent} style={styles.heroBadgeIcon} />
            <Text style={[styles.heroBadgeText, { color: colors.accent }]}>Customer Protection</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Return & Refund Policy</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            At Aspire Enterprises, we take quality and customer trust seriously.
            Every product is thoroughly checked before dispatch. However, we
            understand that issues may occasionally arise during transit.
          </Text>
        </View>

        {/* Returns Eligibility */}
        <Section title="Returns Eligibility" icon="checkmark-circle-outline">
          <BulletPoint text="Transit damage" type="warning" />
          <BulletPoint text="Manufacturing defects" type="warning" />
          <InfoCard
            title="Important Note"
            content="No returns will be accepted for reasons other than the above."
            type="info"
          />
        </Section>

        {/* Reporting Timeline */}
        <Section title="Reporting Timeline" icon="time-outline">
          <View style={styles.timelineContainer}>
            <TimelineItem
              step="1"
              title="Report Within 24 Hours"
              description="Issues must be reported within 24 hours of delivery"
            />
            <TimelineItem
              step="2"
              title="Late Reports Not Accepted"
              description="Requests raised after 24 hours will not be considered"
            />
          </View>
        </Section>

        {/* Proof Required */}
        <Section title="Proof Required" icon="camera-outline">
          <BulletPoint text="Uncut unboxing video of the damaged or defective product" />
          <BulletPoint text="Original packaging images or videos (if available)" />
          <InfoCard
            title="Tip"
            content="For faster processing, ensure the video clearly shows the product, packaging, and the issue."
            type="success"
          />
        </Section>

        {/* Resolution Options */}
        <Section title="Resolution Options" icon="options-outline">
          <BulletPoint text="Replacement of the product" type="success" />
          <BulletPoint text="Credit Note (usable for future purchases)" type="success" />
          <InfoCard
            title="Note"
            content="Refunds in cash or to the original payment method are not applicable."
            type="warning"
          />
        </Section>

        {/* Non-Returnable Items */}
        <Section title="Non-Returnable Items" icon="close-circle-outline">
          <BulletPoint text="Products damaged due to misuse or improper handling" type="error" />
          <BulletPoint text="Minor color or design variations" type="error" />
          <BulletPoint text="Items reported after the 24-hour window" type="error" />
        </Section>

        {/* How to Raise a Request */}
        <Section title="How to Raise a Request" icon="chatbubble-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 16 }]}>
            Please contact our support team within 24 hours of delivery with your
            order details and proof.
          </Text>
          
          <TouchableOpacity
            style={[styles.emailButton, { backgroundColor: colors.highlight }]}
            onPress={handleEmailPress}
            activeOpacity={0.7}
          >
            <Icon name="mail-outline" size={20} color={colors.accent} />
            <Text style={[styles.emailButtonText, { color: colors.accent }]}>support@aspirebrand.store</Text>
            <Icon name="open-outline" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </Section>

        {/* Quick Reference Card */}
        <View style={[styles.quickRefCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.quickRefHeader}>
            <Icon name="time-outline" size={20} color={colors.accent} />
            <Text style={[styles.quickRefTitle, { color: colors.text }]}>Quick Reference</Text>
          </View>
          <View style={styles.quickRefGrid}>
            <View style={styles.quickRefItem}>
              <Icon name="timer-outline" size={24} color={colors.accent} />
              <Text style={[styles.quickRefLabel, { color: colors.textSecondary }]}>Report Within</Text>
              <Text style={[styles.quickRefValue, { color: colors.text }]}>24 Hours</Text>
            </View>
            <View style={styles.quickRefItem}>
              <Icon name="videocam-outline" size={24} color={colors.accent} />
              <Text style={[styles.quickRefLabel, { color: colors.textSecondary }]}>Required Proof</Text>
              <Text style={[styles.quickRefValue, { color: colors.text }]}>Unboxing Video</Text>
            </View>
            <View style={styles.quickRefItem}>
              <Icon name="refresh-outline" size={24} color={colors.accent} />
              <Text style={[styles.quickRefLabel, { color: colors.textSecondary }]}>Resolution</Text>
              <Text style={[styles.quickRefValue, { color: colors.text }]}>Replacement/Credit</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Icon name="shield-checkmark-outline" size={20} color={colors.accent} style={styles.footerIcon} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Your satisfaction is our priority. We're here to help you every step of the way.
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
  paragraph: {
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
  timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  timelineStepText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  emailButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  quickRefCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickRefHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  quickRefTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  quickRefGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickRefItem: {
    alignItems: "center",
    flex: 1,
  },
  quickRefLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  quickRefValue: {
    fontSize: 13,
    fontWeight: "600",
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

export default ReturnRefundPolicyScreen;