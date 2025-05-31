import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle, MapPin, Clock, Calendar, User, Home, Star } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, formatIndianCurrency } from '@/lib/constants';
import { soundManager } from '@/lib/soundManager';
import Card from '@/components/ui/Card';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // In your useEffect:
  useEffect(() => {
    // Play actual success sound file
    const playSuccessEffects = async () => {
      try {
        // 🔊 PLAY ACTUAL SUCCESS SOUND FILE
        await soundManager.playSuccess();
        console.log('✅ Actual success sound file played');
      } catch (error) {
        console.log('❌ Sound error:', error);
      }
    };

    playSuccessEffects();

    // Start animations after sound
    setTimeout(() => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 500); // Wait for sound to start
  }, []);

  const handleTrackMaid = async () => {
    try {
      // 🔊 PLAY ACTUAL SWOOSH SOUND FILE
      await soundManager.playSwoosh();
      console.log('🔊 Actual swoosh sound file played');
    } catch (error) {
      console.log('❌ Sound error:', error);
    }

    setTimeout(() => {
      router.push({
        pathname: '/(booking)/tracking',
        params: {
          bookingId: params.bookingId,
          maidName: params.maidName,
          serviceName: params.serviceName,
        }
      });
    }, 300);
  };

  const handleViewBookings = async () => {
    try {
      await soundManager.playSwoosh();
      console.log('🔊 Swoosh sound played');
    } catch (error) {
      console.log('❌ Sound error:', error);
    }

    setTimeout(() => {
      router.replace('/(tabs)/bookings');
    }, 200);
  };

  const handleGoHome = async () => {
    try {
      await soundManager.playSwoosh();
      console.log('🔊 Swoosh sound played');
    } catch (error) {
      console.log('❌ Sound error:', error);
    }

    setTimeout(() => {
      router.replace('/(tabs)');
    }, 200);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Check Mark */}
        <Animated.View
          style={[
            styles.checkContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.checkCircle}>
            <CheckCircle size={80} color={COLORS.white} />
          </View>
        </Animated.View>

        {/* Success Content */}
        <Animated.View
          style={[
            styles.successContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.successTitle}>Booking Confirmed! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your service has been successfully booked
          </Text>

          {/* Booking Details Card */}
          <Card style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Booking Details</Text>
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <User size={16} color={COLORS.primary} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Service</Text>
                  <Text style={styles.detailValue}>{params.serviceName || 'House Cleaning'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Star size={16} color={COLORS.primary} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Maid</Text>
                  <Text style={styles.detailValue}>{params.maidName || 'Priya Sharma'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Calendar size={16} color={COLORS.primary} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Date & Time</Text>
                  <Text style={styles.detailValue}>
                    {params.bookingDate && params.bookingTime
                      ? `${params.bookingDate} at ${params.bookingTime}`
                      : 'As scheduled'
                    }
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.rupeeIcon}>₹</Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    {formatIndianCurrency(Number(params.totalAmount || 500))}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Next Steps */}
          <Card style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>What's Next?</Text>
            <View style={styles.stepsContent}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepText}>Maid will be assigned within 15 minutes</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepText}>You'll receive a confirmation call</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepText}>Track your maid's location in real-time</Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={styles.trackButton}
          onPress={handleTrackMaid}
        >
          <MapPin size={20} color={COLORS.white} />
          <Text style={styles.trackButtonText}>Track Maid Location</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.bookingsButton}
            onPress={handleViewBookings}
          >
            <Text style={styles.bookingsButtonText}>View Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoHome}
          >
            <Home size={16} color={COLORS.primary} />
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  checkContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successTitle: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    padding: 20,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rupeeIcon: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  stepsCard: {
    width: '100%',
    padding: 20,
  },
  stepsTitle: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepsContent: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  stepInfo: {
    flex: 1,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  trackButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: RADIUS.m,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bookingsButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.m,
    alignItems: 'center',
  },
  bookingsButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: RADIUS.m,
    gap: 6,
  },
  homeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
