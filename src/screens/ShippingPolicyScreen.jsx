import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const ShippingPolicyScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const colors = {
    background: isDarkMode ? '#0a0a0a' : '#f8fafc',
    surface: isDarkMode ? '#1a1a1a' : '#ffffff',
    card: isDarkMode ? '#2a2a2a' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#475569',
    textTertiary: isDarkMode ? '#64748b' : '#64748b',
    accent: '#6366f1',
    accentLight: isDarkMode ? '#818cf8' : '#6366f1',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    highlight: isDarkMode ? '#334155' : '#f1f5f9',
    shadow: isDarkMode ? 'transparent' : '#0000001a',
    link: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
  };

  const handleLinkPress = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const Section = ({ title, children, icon, iconType = 'Ionicons' }) => {
    const renderIcon = () => {
      const iconSize = 24;
      const iconColor = colors.accent;

      if (!icon) return null;

      switch (iconType) {
        case 'MaterialIcons':
          return <MaterialIcons name={icon} size={iconSize} color={iconColor} style={styles.sectionIcon} />;
        case 'FontAwesome':
          return <FontAwesome name={icon} size={iconSize} color={iconColor} style={styles.sectionIcon} />;
        case 'Feather':
          return <Feather name={icon} size={iconSize} color={iconColor} style={styles.sectionIcon} />;
        default:
          return <Icon name={icon} size={iconSize} color={iconColor} style={styles.sectionIcon} />;
      }
    };

    return (
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {title && (
          <View style={styles.sectionHeader}>
            {renderIcon()}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          </View>
        )}
        <View style={styles.sectionContent}>{children}</View>
      </View>
    );
  };

  const BulletPoint = ({ text }) => (
    <View style={styles.bulletPoint}>
      <Icon name="ellipse" size={6} color={colors.accent} style={styles.bulletDot} />
      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );

  const InfoCard = ({ title, content, type = 'info' }) => {
    const cardColors = {
      info: { bg: isDarkMode ? '#1e293b' : '#eef2ff', text: colors.accent, icon: 'information-circle' },
      warning: { bg: isDarkMode ? '#3b2e1e' : '#fffbeb', text: colors.warning, icon: 'alert-triangle' },
      success: { bg: isDarkMode ? '#1e3a2e' : '#f0fdf4', text: colors.success, icon: 'checkmark-circle' },
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
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shipping Policy</Text>
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
            <Icon name="cube-outline" size={14} color={colors.accent} style={styles.heroBadgeIcon} />
            <Text style={[styles.heroBadgeText, { color: colors.accent }]}>Shipping Information</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Shipping Policy</Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>Last Updated: January 2026</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Welcome to ASPIRE ENTERPRISES. We believe good business is built on clarity and trust—especially
            when it comes to delivering what you've ordered. This Shipping Policy explains how, when, and
            where we ship our products, so there are no surprises later.
          </Text>
        </View>

        {/* 1. Shipping Locations */}
        <Section title="Shipping Locations" icon="location-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We currently ship across India. At this time, international shipping is not available. Orders
            are delivered to the shipping address provided at checkout. Please ensure all details are
            accurate and complete.
          </Text>
        </Section>

        {/* 2. Order Processing Time */}
        <Section title="Order Processing Time" icon="time-outline">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            All orders are processed within 1–2 business days after payment confirmation. Orders placed
            on Sundays or public holidays will be processed on the next working day. During peak seasons,
            festivals, or promotional sales, processing times may be slightly longer. We appreciate your
            patience—quality and care come first.
          </Text>
        </Section>

        {/* 3. Delivery Timeframes */}
        <Section title="Delivery Timeframes" icon="car-outline" iconType="Ionicons">
          <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 12 }]}>
            Estimated delivery timelines after dispatch:
          </Text>
          <BulletPoint text="Hyderabad: Same-day or next-day delivery (subject to availability)" />
          <BulletPoint text="Metro Cities: 2–4 business days" />
          <BulletPoint text="Other Cities & Towns: 3–7 business days" />
          <BulletPoint text="Remote / Rural Areas: 5–10 business days" />
          <InfoCard
            title="Note"
            content="Delivery timelines are estimates and may vary due to courier delays, weather conditions, or unforeseen circumstances beyond our control."
            type="info"
          />
        </Section>

        {/* 4. Shipping Charges */}
        <Section title="Shipping Charges" icon="wallet-outline" iconType="Ionicons">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Shipping charges (if applicable) are clearly displayed at checkout before payment. We may
            offer free shipping on select products or during special promotional periods. Same-day or
            express delivery services (where available) may carry additional charges.
          </Text>
        </Section>

        {/* 5. Courier & Delivery Partners */}
        <Section title="Courier & Delivery Partners" icon="cube-outline" iconType="Ionicons">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We work with reliable third-party courier partners to ensure safe and timely delivery. Once
            your order is shipped, tracking details will be shared via SMS, email, or WhatsApp. Delivery
            attempts are usually made during standard business hours.
          </Text>
        </Section>

        {/* 6. Order Tracking */}
        <Section title="Order Tracking" icon="map-outline" iconType="Ionicons">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            After dispatch, you will receive a tracking ID. You can track your order using the courier
            partner's tracking link. If tracking information does not update immediately, allow 24 hours
            for the system to refresh.
          </Text>
        </Section>

        {/* 7. Delays & Exceptions */}
        <Section title="Delays & Exceptions" icon="warning-outline" iconType="Ionicons">
          <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 12 }]}>
            While we aim for timely delivery, delays may occur due to:
          </Text>
          <BulletPoint text="Incorrect or incomplete shipping address" />
          <BulletPoint text="Natural disasters or extreme weather conditions" />
          <BulletPoint text="Government restrictions or local lockdowns" />
          <BulletPoint text="Courier partner operational issues" />
          <InfoCard
            title="Disclaimer"
            content="ASPIRE ENTERPRISES is not liable for delays caused by circumstances beyond our reasonable control."
            type="warning"
          />
        </Section>

        {/* 8. Undelivered or Returned Shipments */}
        <Section title="Undelivered or Returned Shipments" icon="return-up-back-outline" iconType="Ionicons">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            If a delivery fails due to incorrect address or customer unavailability, the order may be
            returned to us. Re-shipping charges, if applicable, must be borne by the customer. Orders
            returned due to refusal of delivery without valid reason may not be eligible for a refund.
          </Text>
        </Section>

        {/* 9. Damaged or Missing Items */}
        <Section title="Damaged or Missing Items" icon="alert-circle-outline" iconType="Ionicons">
          <InfoCard
            title="Important"
            content="If you receive a damaged product, a missing item, or an incorrect product, please contact us within 24 hours of delivery with clear photos/videos of the package and product. We take responsibility seriously and will investigate promptly."
            type="success"
          />
        </Section>

        {/* 10. Changes to Policy */}
        <Section title="Changes to This Policy" icon="create-outline" iconType="Ionicons">
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            ASPIRE ENTERPRISES reserves the right to update or modify this Shipping Policy at any time
            without prior notice. Changes will be effective immediately upon being posted on our website.
          </Text>
        </Section>

        {/* 11. Contact Us */}
        <Section title="Contact Us" icon="call-outline" iconType="Ionicons">
          <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 16 }]}>
            If you have any questions about shipping or delivery, feel free to reach out:
          </Text>
          <View style={[styles.contactCard, { backgroundColor: colors.highlight }]}>
            <TouchableOpacity
              style={styles.contactItem}
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
              <Icon name="open-outline" size={18} color={colors.textTertiary} style={styles.contactArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
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
              <Icon name="open-outline" size={18} color={colors.textTertiary} style={styles.contactArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleLinkPress('https://wa.me/918096100571')}
              activeOpacity={0.7}
            >
              <View style={styles.contactIconContainer}>
                <FontAwesome name="whatsapp" size={24} color="#25D366" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.textTertiary }]}>WhatsApp</Text>
                <Text style={[styles.contactValue, { color: colors.link }]}>+91 80961 00571</Text>
              </View>
              <Icon name="open-outline" size={18} color={colors.textTertiary} style={styles.contactArrow} />
            </TouchableOpacity>
          </View>
        </Section>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Icon name="heart-outline" size={20} color={colors.accent} style={styles.footerIcon} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            We respect traditional business values—clear promises, honest timelines, and dependable
            service. Thank you for choosing ASPIRE ENTERPRISES. We look forward to serving you again.
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
    fontWeight: '600',
  },
  title: {
    fontSize: width > 600 ? 36 : 28,
    fontWeight: 'bold',
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
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletDot: {
    marginTop: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  infoCardContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: 12,
    padding: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  contactIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 8,
  },
  contactLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactArrow: {
    marginLeft: 8,
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerIcon: {
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ShippingPolicyScreen;