import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../theme/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';
import { locationService } from '../../../services/location/locationService';
import { WebFooter } from '../../../components/navigation/WebFooter';

export default function WebsiteHomeScreen() {
  const { isDark } = useTheme();
  const { width } = useResponsive();

  const isDesktop = width >= 1100;
  const isTablet = width >= 720 && width < 1100;
  const isMobile = width < 640;

  const [locationInput, setLocationInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const coords = await locationService.getCurrentLocation();
      if (coords && coords.address) {
        setLocationInput(coords.address);
      } else {
        setLocationInput('Dindigul West, Tamil Nadu');
      }
    } catch {
      setLocationInput('Dindigul West, Tamil Nadu');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearchMechanics = () => {
    if (locationInput.trim()) {
      router.push({
        pathname: '/(customer)/nearby-mechanics',
        params: { location: locationInput.trim() },
      });
    } else {
      router.push('/(customer)/nearby-mechanics');
    }
  };

  const servicesList = [
    {
      id: 'general_service',
      title: 'General Service',
      icon: 'build-outline',
      route: '/(customer)/services-pricing',
    },
    {
      id: 'battery_service',
      title: 'Battery Service',
      icon: 'battery-charging-outline',
      route: '/(customer)/services-pricing',
    },
    {
      id: 'tyre_service',
      title: 'Tyre Service',
      icon: 'disc-outline',
      route: '/(customer)/services-pricing',
    },
    {
      id: 'oil_change',
      title: 'Oil Change',
      icon: 'water-outline',
      route: '/(customer)/services-pricing',
    },
    {
      id: 'breakdown_support',
      title: 'Breakdown Support',
      icon: 'car-outline',
      route: '/(customer)/breakdown-request',
    },
    {
      id: 'ac_service',
      title: 'AC Service',
      icon: 'snow-outline',
      route: '/(customer)/services-pricing',
    },
    {
      id: 'car_care',
      title: 'Car Care\n(Wash & Clean)',
      icon: 'sparkles-outline',
      route: '/(customer)/services-pricing',
    },
    {
      id: 'more_services',
      title: 'More Services',
      icon: 'grid-outline',
      route: '/(customer)/services-pricing',
    },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      icon: 'call-outline',
      title: 'Request a Service',
      description: 'Choose the service you need and your location.',
    },
    {
      step: '02',
      icon: 'person-outline',
      title: 'Get a Mechanic',
      description: 'Connect with a verified nearby mechanic.',
    },
    {
      step: '03',
      icon: 'construct-outline',
      title: 'Service at Your Place',
      description: 'Get professional service at your convenience.',
    },
    {
      step: '04',
      icon: 'shield-checkmark-outline',
      title: 'Drive with Confidence',
      description: 'Your vehicle, ready for the road again.',
    },
  ];

  const whyChooseFeatures = [
    {
      icon: 'shield-checkmark-outline',
      title: 'Trusted & Verified Mechanics',
      description: 'Skilled professionals with verified profiles.',
    },
    {
      icon: 'flash-outline',
      title: 'Fast & Reliable Service',
      description: 'Quick response when you need it most.',
    },
    {
      icon: 'location-outline',
      title: 'Service at Your Location',
      description: 'Get help at home, office, or on the road.',
    },
    {
      icon: 'cash-outline',
      title: 'Transparent & Fair Pricing',
      description: 'No hidden charges, only honest service.',
    },
  ];

  const faqList = [
    {
      question: 'How can I find a mechanic near me?',
      answer:
        'Enter your location or click the locate icon on the homepage search bar. MECHFIND automatically displays all verified workshops and mobile mechanics near you with upfront pricing and ratings.',
    },
    {
      question: 'How do I request roadside assistance?',
      answer:
        'Select your breakdown category (such as Flat Tyre, Battery Jumpstart, or Towing), confirm your breakdown location, and tap Request. A nearby verified technician will be dispatched to your spot immediately.',
    },
    {
      question: 'Can I check service prices before booking?',
      answer:
        'Yes. MECHFIND features 100% upfront transparent pricing across standard services. Any additional parts or repairs require customer quote approval before work begins.',
    },
    {
      question: 'How can I track my booking?',
      answer:
        'Once a mechanic accepts your request, you can track their live location, estimated arrival time, and service progress in real time directly inside the app.',
    },
    {
      question: 'How can I join MECHFIND as a mechanic?',
      answer:
        "Click 'Become a Mechanic' in the top navigation, register your workshop with business credentials, and submit verification documents. Once verified, you will start receiving customer service dispatches.",
    },
  ];

  return (
    <View style={[styles.pageWrapper, { backgroundColor: isDark ? '#101114' : '#FFFFFF' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
        {/* ========================================================= */}
        {/* SECTION 1 — HERO SECTION                                  */}
        {/* ========================================================= */}
        <View style={styles.heroSectionWrap}>
          {/* Subtle yellow top-right geometric accent */}
          <View style={styles.heroYellowAccent} />

          <View style={styles.heroContentContainer}>
            <View
              style={[
                styles.heroGridRow,
                isDesktop ? styles.heroGridRowDesktop : styles.heroGridRowMobile,
              ]}
            >
              {/* Left Column: Text + Location Search Box + Trust Badges */}
              <View style={[styles.heroLeftCol, isDesktop && { maxWidth: 580 }]}>
                {/* Brand Pill */}
                <View style={styles.heroBrandPill}>
                  <Text style={styles.heroBrandPillText}>MECHFIND</Text>
                  <View style={styles.heroBrandUnderline} />
                </View>

                {/* Main Headline */}
                <Text
                  style={[
                    styles.heroMainTitle,
                    width < 440 && { fontSize: 30, lineHeight: 38 },
                    width >= 440 && width < 768 && { fontSize: 36, lineHeight: 44 },
                  ]}
                >
                  On-Demand{'\n'}Vehicle Service{'\n'}
                  <Text style={styles.heroMainTitleYellow}>at Your Doorstep</Text>
                </Text>

                {/* Subtitle Description */}
                <Text style={styles.heroSubtitle}>
                  Find verified mechanics near you for service, breakdown
                  support, and all your vehicle care needs — anytime, anywhere.
                </Text>

                {/* Location Search Bar */}
                <View style={[styles.searchBarBox, isMobile && styles.searchBarBoxMobile]}>
                  <View style={styles.searchBarInputRow}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#FFC400"
                      style={{ marginLeft: 14 }}
                    />
                    <TextInput
                      style={styles.searchLocationInput}
                      placeholder="Enter your location (e.g., Dindigul)"
                      placeholderTextColor="#747B87"
                      value={locationInput}
                      onChangeText={setLocationInput}
                      onSubmitEditing={handleSearchMechanics}
                    />

                    {/* Locate Button */}
                    <Pressable
                      style={styles.locateBtn}
                      onPress={handleGetCurrentLocation}
                      hitSlop={8}
                      accessibilityLabel="Detect my location"
                    >
                      {isLocating ? (
                        <ActivityIndicator size="small" color="#FFC400" />
                      ) : (
                        <Ionicons name="locate-outline" size={20} color="#747B87" />
                      )}
                    </Pressable>

                    {/* Desktop Submit CTA */}
                    {!isMobile && (
                      <Pressable
                        style={styles.searchCtaBtn}
                        onPress={handleSearchMechanics}
                        accessibilityRole="button"
                      >
                        <Text style={styles.searchCtaBtnText}>Find a Mechanic</Text>
                        <Ionicons name="arrow-forward" size={16} color="#101114" />
                      </Pressable>
                    )}
                  </View>

                  {/* Mobile Full-Width Submit CTA */}
                  {isMobile && (
                    <Pressable
                      style={styles.searchCtaBtnMobile}
                      onPress={handleSearchMechanics}
                      accessibilityRole="button"
                    >
                      <Text style={styles.searchCtaBtnText}>Find a Mechanic</Text>
                      <Ionicons name="arrow-forward" size={16} color="#101114" />
                    </Pressable>
                  )}
                </View>

                {/* 7 KM Radius Quick Search Feature Pill */}
                <Pressable
                  style={styles.webRadiusChip}
                  onPress={() =>
                    router.push({
                      pathname: '/(customer)/nearby-mechanics',
                      params: { filter: 'within_7km' },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Find verified mechanics within 7 km radius"
                >
                  <View style={styles.webRadiusChipIconBox}>
                    <Ionicons name="flash" size={12} color="#101114" />
                  </View>
                  <Text style={styles.webRadiusChipText}>
                    ⚡ Find Verified Mechanics within 7 km Radius (Instant Response)
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFC400" />
                </Pressable>

                {/* Hero Trust Indicators (3 Badges) */}
                <View style={styles.trustBadgesRow}>
                  <View style={styles.trustBadgeItem}>
                    <Ionicons
                      name="shield-checkmark"
                      size={20}
                      color="#FFC400"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.trustBadgeText}>
                      Verified{'\n'}Mechanics
                    </Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <Ionicons
                      name="flash"
                      size={20}
                      color="#FFC400"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.trustBadgeText}>
                      Quick{'\n'}Response
                    </Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <Ionicons
                      name="location"
                      size={20}
                      color="#FFC400"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.trustBadgeText}>
                      Wide{'\n'}Service Coverage
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right Column: Hero Visual Graphic */}
              <View style={[styles.heroRightCol, isDesktop ? { flex: 1 } : { width: '100%', marginTop: 24 }]}>
                <Image
                  source={require('../../../../assets/images/web-hero-mechanic.png')}
                  style={styles.heroMechanicImg}
                  resizeMode="contain"
                  accessibilityLabel="MECHFIND verified mechanic in workshop"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 2 — HOW MECHFIND WORKS (SIMPLE PROCESS)           */}
        {/* ========================================================= */}
        <View style={[styles.sectionWrapper, { backgroundColor: isDark ? '#141518' : '#F9FAFB' }]}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderCentered}>
              <Text style={styles.sectionEyebrow}>SIMPLE PROCESS</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                How MECHFIND Works
              </Text>
            </View>

            <View style={[styles.stepsRow, isDesktop ? styles.stepsRowDesktop : styles.stepsRowMobile]}>
              {howItWorksSteps.map((item, idx) => (
                <React.Fragment key={item.step}>
                  <View
                    style={[
                      styles.stepCard,
                      {
                        backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                        borderColor: isDark ? '#2D3139' : '#E5E7EB',
                      },
                    ]}
                  >
                    <View style={styles.stepIconBox}>
                      <Ionicons name={item.icon as any} size={24} color="#101114" />
                    </View>
                    <Text
                      style={[
                        styles.stepTitle,
                        { color: isDark ? '#FFFFFF' : '#101114' },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.stepDesc}>{item.description}</Text>
                  </View>

                  {/* Desktop Connector Arrow between steps */}
                  {isDesktop && idx < howItWorksSteps.length - 1 && (
                    <View style={styles.stepArrowWrap}>
                      <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 3 — COMPLETE VEHICLE CARE SERVICES                */}
        {/* ========================================================= */}
        <View style={[styles.sectionWrapper, { backgroundColor: isDark ? '#101114' : '#FFFFFF' }]}>
          <View style={styles.sectionContainer}>
            {/* Header with Title + "View All Services ->" */}
            <View
              style={[
                styles.servicesHeaderRow,
                isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
              ]}
            >
              <View style={{ maxWidth: '100%' }}>
                <Text style={styles.sectionEyebrow}>OUR SERVICES</Text>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                    isMobile && { fontSize: 22, lineHeight: 28 },
                  ]}
                >
                  Complete Vehicle Care Services
                </Text>
              </View>

              <Pressable
                onPress={() => router.push('/(customer)/services-pricing')}
                style={styles.viewAllServicesBtn}
              >
                <Text style={styles.viewAllServicesText}>View All Services</Text>
                <Ionicons name="arrow-forward" size={15} color="#FFC400" />
              </Pressable>
            </View>

            {/* Content: 8 Services Grid on Left + Promo Car Care Banner on Right */}
            <View style={[styles.servicesLayoutRow, isDesktop ? styles.servicesLayoutRowDesktop : styles.servicesLayoutRowMobile]}>
              {/* 8 Services Grid */}
              <View style={styles.servicesGridLeft}>
                <View style={styles.servicesGrid}>
                  {servicesList.map((svc) => (
                    <Pressable
                      key={svc.id}
                      style={[
                        styles.serviceGridCard,
                        {
                          backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                          borderColor: isDark ? '#2D3139' : '#E5E7EB',
                        },
                      ]}
                      onPress={() => router.push(svc.route as never)}
                    >
                      <View style={styles.serviceIconWrap}>
                        <Ionicons name={svc.icon as any} size={26} color="#101114" />
                      </View>
                      <Text
                        style={[
                          styles.serviceCardTitle,
                          { color: isDark ? '#FFFFFF' : '#101114' },
                        ]}
                      >
                        {svc.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Promotional Service Banner */}
              <View style={styles.promoBannerRight}>
                <View style={styles.promoBannerCard}>
                  {/* Decorative Yellow Corner Slice */}
                  <View style={styles.bannerYellowCornerSlice} />

                  <View style={styles.promoBannerContent}>
                    <Text style={styles.promoBannerHeadline}>
                      Complete{'\n'}Car Care{'\n'}
                      <Text style={{ color: '#FFC400' }}>in One Place</Text>
                    </Text>

                    <View style={styles.promoCheckItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#FFC400" />
                      <Text style={styles.promoCheckText}>Professional Mechanics</Text>
                    </View>

                    <View style={styles.promoCheckItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#FFC400" />
                      <Text style={styles.promoCheckText}>Transparent Service</Text>
                    </View>

                    <View style={styles.promoCheckItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#FFC400" />
                      <Text style={styles.promoCheckText}>At Your Location</Text>
                    </View>
                  </View>

                  <Image
                    source={require('../../../../assets/images/web-car-care-car.png')}
                    style={styles.promoCarImg}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 4 — WHY CHOOSE MECHFIND?                          */}
        {/* ========================================================= */}
        <View style={[styles.sectionWrapper, { backgroundColor: isDark ? '#141518' : '#F9FAFB' }]}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderCentered}>
              <Text style={styles.sectionEyebrow}>WHY MECHFIND</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Why Choose MECHFIND?
              </Text>
            </View>

            <View style={[styles.featuresRow, isDesktop ? styles.featuresRowDesktop : styles.featuresRowMobile]}>
              {whyChooseFeatures.map((feat) => (
                <View
                  key={feat.title}
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                      borderColor: isDark ? '#2D3139' : '#E5E7EB',
                    },
                  ]}
                >
                  <View style={styles.featureIconBox}>
                    <Ionicons name={feat.icon as any} size={24} color="#101114" />
                  </View>
                  <Text
                    style={[
                      styles.featureTitle,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    {feat.title}
                  </Text>
                  <Text style={styles.featureDesc}>{feat.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 5 — DOWNLOAD MECHFIND APP                         */}
        {/* ========================================================= */}
        <View style={styles.appDownloadSectionWrap}>
          <View style={styles.appDownloadContainer}>
            {/* Dark Card with dual yellow corner accents */}
            <View style={styles.appDownloadCard}>
              <View style={styles.appCornerYellowTopLeft} />
              <View style={styles.appCornerYellowBottomRight} />

              <View
                style={[
                  styles.appDownloadRow,
                  isDesktop ? styles.appDownloadRowDesktop : styles.appDownloadRowMobile,
                ]}
              >
                {/* Left: 3D Phones Mockup */}
                <View style={styles.appMockupCol}>
                  <Image
                    source={require('../../../../assets/images/web-app-mockups.png')}
                    style={styles.appMockupImg}
                    resizeMode="contain"
                    accessibilityLabel="MECHFIND Customer Mobile App"
                  />
                </View>

                {/* Right: Headlines + Store Buttons */}
                <View style={styles.appCopyCol}>
                  <Text style={styles.appSectionEyebrow}>MECHFIND APP</Text>
                  <Text style={[styles.appDownloadTitle, isMobile && { fontSize: 24, lineHeight: 30 }]}>
                    Download the MECHFIND App
                  </Text>
                  <Text style={styles.appDownloadDesc}>
                    Book services, track your requests, manage your vehicles and
                    get roadside help — all in one app.
                  </Text>

                  {/* App Store Download Badges */}
                  <View style={styles.storeBadgesRow}>
                    <Pressable
                      style={styles.storeBadgeBtn}
                      onPress={() => Linking.openURL('https://play.google.com')}
                      accessibilityLabel="Get it on Google Play"
                    >
                      <Ionicons name="logo-google-playstore" size={24} color="#FFFFFF" />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.storeBadgeSub}>GET IT ON</Text>
                        <Text style={styles.storeBadgeMain}>Google Play</Text>
                      </View>
                    </Pressable>

                    <Pressable
                      style={styles.storeBadgeBtn}
                      onPress={() => Linking.openURL('https://apple.com/app-store')}
                      accessibilityLabel="Download on the App Store"
                    >
                      <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.storeBadgeSub}>Download on the</Text>
                        <Text style={styles.storeBadgeMain}>App Store</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 6 — BECOME A MECHFIND MECHANIC                    */}
        {/* ========================================================= */}
        <View style={[styles.sectionWrapper, { backgroundColor: isDark ? '#101114' : '#FFFFFF' }]}>
          <View style={styles.sectionContainer}>
            <View
              style={[
                styles.partnerBannerCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#101114',
                  borderColor: isDark ? '#2D3139' : '#1F2024',
                },
              ]}
            >
              <View style={styles.partnerBannerLeft}>
                <Text style={styles.sectionEyebrow}>FOR WORKSHOP OWNERS</Text>
                <Text style={styles.partnerBannerTitle}>
                  Grow Your Workshop with MECHFIND
                </Text>
                <Text style={styles.partnerBannerDesc}>
                  Join our verified mechanic network and connect with customers
                  looking for reliable vehicle care and emergency roadside help.
                </Text>

                <View style={styles.partnerBenefitsRow}>
                  <View style={styles.partnerBenefitItem}>
                    <Ionicons name="checkmark-circle" size={17} color="#FFC400" />
                    <Text style={styles.partnerBenefitText}>Live Dispatches in 15 km Radius</Text>
                  </View>
                  <View style={styles.partnerBenefitItem}>
                    <Ionicons name="checkmark-circle" size={17} color="#FFC400" />
                    <Text style={styles.partnerBenefitText}>Transparent Direct Payouts</Text>
                  </View>
                </View>

                <Pressable
                  style={styles.partnerRegisterBtn}
                  onPress={() => router.push('/(customer)/become-mechanic')}
                >
                  <Text style={styles.partnerRegisterBtnText}>Become a Mechanic</Text>
                  <Ionicons name="arrow-forward" size={16} color="#101114" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 7 — FAQ SECTION                                   */}
        {/* ========================================================= */}
        <View style={[styles.sectionWrapper, { backgroundColor: isDark ? '#141518' : '#F9FAFB' }]}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderCentered}>
              <Text style={styles.sectionEyebrow}>FAQS</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Frequently Asked Questions
              </Text>
            </View>

            <View style={styles.faqAccordionWrap}>
              {faqList.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <View
                    key={faq.question}
                    style={[
                      styles.faqItemCard,
                      {
                        backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                        borderColor: isDark ? '#2D3139' : '#E5E7EB',
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.faqQuestionRow}
                      onPress={() => setExpandedFaq(isOpen ? null : index)}
                    >
                      <Text
                        style={[
                          styles.faqQuestionText,
                          { color: isDark ? '#FFFFFF' : '#101114' },
                        ]}
                      >
                        {faq.question}
                      </Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={isOpen ? '#FFC400' : isDark ? '#9CA3AF' : '#6B7280'}
                      />
                    </Pressable>

                    {isOpen && (
                      <View style={styles.faqAnswerWrap}>
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 8 — FINAL CALL TO ACTION                          */}
        {/* ========================================================= */}
        <View style={styles.finalCtaSectionWrap}>
          <View style={styles.finalCtaContainer}>
            <View style={styles.finalCtaCard}>
              <View style={styles.finalCtaAccent} />
              <Text style={styles.finalCtaTitle}>Need Help with Your Vehicle?</Text>
              <Text style={styles.finalCtaSubtitle}>
                Find nearby mechanics and get the vehicle support you need.
              </Text>

              <View style={styles.finalCtaButtonsRow}>
                <Pressable
                  style={styles.finalCtaPrimaryBtn}
                  onPress={() => router.push('/(customer)/nearby-mechanics')}
                >
                  <Text style={styles.finalCtaPrimaryBtnText}>Find a Mechanic</Text>
                  <Ionicons name="arrow-forward" size={16} color="#101114" />
                </Pressable>

                <Pressable
                  style={styles.finalCtaSecondaryBtn}
                  onPress={() => router.push('/(customer)/services-pricing')}
                >
                  <Text style={styles.finalCtaSecondaryBtnText}>Explore Services</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 9 — COMPLETE FOOTER                               */}
        {/* ========================================================= */}
        <WebFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  // Section layout
  sectionWrapper: {
    width: '100%',
    paddingVertical: 56,
  },
  sectionContainer: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  sectionHeaderCentered: {
    alignItems: 'center',
    marginBottom: 40,
    textAlign: 'center',
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFC400',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  // 1. Hero Section
  heroSectionWrap: {
    width: '100%',
    backgroundColor: '#101114',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 36,
    paddingBottom: 48,
  },
  heroYellowAccent: {
    position: 'absolute',
    top: -80,
    right: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(255, 196, 0, 0.08)',
  },
  heroContentContainer: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  heroGridRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroGridRowDesktop: {
    flexDirection: 'row',
    gap: 36,
  },
  heroGridRowMobile: {
    flexDirection: 'column',
    gap: 20,
  },
  heroLeftCol: {
    zIndex: 2,
  },
  heroBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBrandPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFC400',
    letterSpacing: 2,
  },
  heroBrandUnderline: {
    width: 24,
    height: 2,
    backgroundColor: '#FFC400',
    marginLeft: 8,
  },
  heroMainTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 14,
  },
  heroMainTitleYellow: {
    color: '#FFC400',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#9CA3AF',
    marginBottom: 26,
    maxWidth: 520,
  },
  // Location Search Box
  searchBarBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  searchBarBoxMobile: {
    padding: 10,
    gap: 8,
  },
  searchBarInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchLocationInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#101114',
    height: 44,
  },
  locateBtn: {
    paddingHorizontal: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCtaBtn: {
    backgroundColor: '#FFC400',
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchCtaBtnMobile: {
    backgroundColor: '#FFC400',
    borderRadius: 12,
    width: '100%',
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  searchCtaBtnText: {
    color: '#101114',
    fontSize: 13.5,
    fontWeight: '800',
  },
  webRadiusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 196, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 196, 0, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  webRadiusChipIconBox: {
    backgroundColor: '#FFC400',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webRadiusChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFC400',
  },
  // Trust Badges
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
    alignItems: 'center',
  },
  trustBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#C7C9CE',
    fontWeight: '600',
  },
  // Right Column Visual
  heroRightCol: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  heroMechanicImg: {
    width: '100%',
    maxWidth: 560,
    height: 380,
  },
  // 2. How It Works
  stepsRow: {
    gap: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepsRowDesktop: {
    flexDirection: 'row',
  },
  stepsRowMobile: {
    flexDirection: 'column',
    width: '100%',
  },
  stepCard: {
    flex: 1,
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    minHeight: 180,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#747B87',
  },
  stepArrowWrap: {
    paddingHorizontal: 4,
  },
  // 3. Complete Services
  servicesHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  viewAllServicesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  viewAllServicesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFC400',
  },
  servicesLayoutRow: {
    gap: 24,
  },
  servicesLayoutRowDesktop: {
    flexDirection: 'row',
  },
  servicesLayoutRowMobile: {
    flexDirection: 'column',
  },
  servicesGridLeft: {
    flex: 1.45,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  serviceGridCard: {
    width: 'calc(25% - 11px)' as any,
    minWidth: 125,
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  serviceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  promoBannerRight: {
    flex: 0.95,
    minWidth: 0,
    width: '100%',
  },
  promoBannerCard: {
    backgroundColor: '#101114',
    borderRadius: 20,
    padding: 26,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 280,
    justifyContent: 'center',
  },
  bannerYellowCornerSlice: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 54,
    borderRightWidth: 54,
    borderTopColor: '#FFC400',
    borderRightColor: '#FFC400',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    zIndex: 4,
  },
  promoBannerContent: {
    zIndex: 3,
    maxWidth: '56%',
  },
  promoBannerHeadline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
    marginBottom: 16,
  },
  promoCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  promoCheckText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  promoCarImg: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '54%',
    height: '100%',
    zIndex: 1,
  },
  // 4. Why Choose MECHFIND
  featuresRow: {
    gap: 16,
  },
  featuresRowDesktop: {
    flexDirection: 'row',
  },
  featuresRowMobile: {
    flexDirection: 'column',
  },
  featureCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#747B87',
  },
  // 5. App Download
  appDownloadSectionWrap: {
    width: '100%',
    paddingVertical: 48,
    backgroundColor: '#101114',
  },
  appDownloadContainer: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  appDownloadCard: {
    backgroundColor: '#101114',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2D3139',
    padding: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  appCornerYellowTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    backgroundColor: '#FFC400',
    borderTopLeftRadius: 24,
  },
  appCornerYellowBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: '#FFC400',
    borderBottomRightRadius: 24,
  },
  appDownloadRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 28,
  },
  appDownloadRowDesktop: {
    flexDirection: 'row',
  },
  appDownloadRowMobile: {
    flexDirection: 'column-reverse',
  },
  appMockupCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appMockupImg: {
    width: 360,
    height: 280,
    maxWidth: '100%',
  },
  appCopyCol: {
    flex: 1.2,
  },
  appSectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFC400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  appDownloadTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  appDownloadDesc: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#9CA3AF',
    marginBottom: 24,
    maxWidth: 480,
  },
  storeBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  storeBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101114',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  storeBadgeSub: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  storeBadgeMain: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // 6. Become a Mechanic
  partnerBannerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 36,
  },
  partnerBannerLeft: {
    maxWidth: 640,
  },
  partnerBannerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  partnerBannerDesc: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  partnerBenefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginBottom: 24,
  },
  partnerBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partnerBenefitText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#C7C9CE',
  },
  partnerRegisterBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFC400',
    borderRadius: 14,
    paddingHorizontal: 22,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partnerRegisterBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#101114',
  },
  // 7. FAQs
  faqAccordionWrap: {
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  faqItemCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    paddingRight: 12,
  },
  faqAnswerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  faqAnswerText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#747B87',
  },
  // 8. Final Call to Action
  finalCtaSectionWrap: {
    width: '100%',
    paddingVertical: 56,
    backgroundColor: '#101114',
  },
  finalCtaContainer: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  finalCtaCard: {
    backgroundColor: '#1A1B1F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2D3139',
    paddingVertical: 48,
    paddingHorizontal: 28,
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  finalCtaAccent: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 140,
    height: 4,
    backgroundColor: '#FFC400',
  },
  finalCtaTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  finalCtaSubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    marginBottom: 28,
    textAlign: 'center',
    maxWidth: 480,
  },
  finalCtaButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
  },
  finalCtaPrimaryBtn: {
    backgroundColor: '#FFC400',
    borderRadius: 14,
    paddingHorizontal: 24,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finalCtaPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#101114',
  },
  finalCtaSecondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 24,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalCtaSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

