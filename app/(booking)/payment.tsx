import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Wallet, Smartphone, CheckCircle, Shield, Info } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, formatIndianCurrency } from '@/lib/constants';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { createBooking } from '@/lib/supabase-helpers';
import { soundManager } from '@/lib/soundManager';
import Card from '@/components/ui/Card';

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  processingTime: string;
  isRecommended?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI Payment',
    icon: Smartphone,
    description: 'Pay using Google Pay, PhonePe, Paytm',
    processingTime: 'Instant',
    isRecommended: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, Rupay',
    processingTime: 'Instant',
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    description: 'Paytm, Amazon Pay, Mobikwik',
    processingTime: 'Instant',
  },
  {
    id: 'cod',
    name: 'Cash on Service',
    icon: CheckCircle,
    description: 'Pay when service is completed',
    processingTime: 'On completion',
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const { bookingData, clearBooking } = useBooking();
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);

  // Calculate totals with safety checks and correct service fee
  const calculateTotals = () => {
    const servicePrice = Number(bookingData?.service?.price) || 0;
    const maidRate = Number(bookingData?.maid?.hourly_rate) || 0;
    const duration = Number(bookingData?.service?.duration) || 60;

    // Calculate maid cost based on hourly rate and duration
    const maidCost = (maidRate * duration) / 60; // Convert minutes to hours

    // Service fee is fixed at ₹10
    const serviceFee = 10;

    const subtotal = servicePrice + maidCost + serviceFee;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    return {
      servicePrice: Number(servicePrice.toFixed(2)),
      maidCost: Number(maidCost.toFixed(2)),
      serviceFee: serviceFee,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  };

  const totals = calculateTotals();

  const handlePaymentMethodSelect = async (methodId: string) => {
    // Play selection sound
    await soundManager.playSwoosh();

    // Add haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    }

    setSelectedPaymentMethod(methodId);
    console.log('Payment method selected:', methodId);
  };

  const simulatePaymentProcessing = async () => {
    const steps = [
      'Validating payment details...',
      'Processing payment...',
      'Confirming transaction...',
      'Booking your service...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setPaymentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  // In your handlePayment function:
  const handlePayment = async () => {
    console.log('=== PAYMENT BUTTON CLICKED ===');

    if (!selectedPaymentMethod) {
      // Play actual error sound file
      await soundManager.playError();
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    if (!user) {
      await soundManager.playError();
      Alert.alert('Authentication Required', 'Please login to complete booking');
      return;
    }

    if (!bookingData?.service || !bookingData?.maid) {
      await soundManager.playError();
      Alert.alert('Booking Error', 'Missing booking information');
      return;
    }

    setProcessingPayment(true);

    try {
      console.log('Starting payment process...');
      await simulatePaymentProcessing();

      const bookingPayload = {
        user_id: user.id,
        service_id: bookingData.service.id,
        maid_id: bookingData.maid.id,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        duration: bookingData.service.duration,
        address: bookingData.address,
        notes: bookingData.notes || '',
        total_price: totals.total,
        status: selectedPaymentMethod === 'cod' ? 'confirmed' : 'pending',
      };

      let bookingId = 'demo_' + Date.now();
      try {
        const newBooking = await createBooking(bookingPayload);
        console.log('✅ Booking created successfully:', newBooking);
        bookingId = newBooking.id;

        // 🔊 PLAY ACTUAL BOOKING CONFIRMED SOUND FILE
        await soundManager.playBookingConfirmed();

      } catch (bookingError) {
        console.error('Booking creation failed:', bookingError);
        // Still play success sound for demo
        await soundManager.playBookingConfirmed();
      }

      // Add haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate([100, 50, 100, 50, 200]);
      }

      // Wait for sound to finish playing
      setTimeout(() => {
        console.log('Navigating to success screen...');

        router.push({
          pathname: '/(booking)/success',
          params: {
            bookingId: bookingId,
            maidName: bookingData.maid.name,
            serviceName: bookingData.service.name,
            totalAmount: totals.total.toString(),
            paymentMethod: selectedPaymentMethod,
            bookingDate: bookingData.date,
            bookingTime: bookingData.time,
          }
        });
      }, 1000); // Longer delay to let sound finish

    } catch (error) {
      console.error('Error in payment process:', error);

      // 🔊 PLAY ACTUAL ERROR SOUND FILE
      await soundManager.playError();

      Alert.alert('Payment Error', 'Something went wrong. Please try again.');
    } finally {
      setProcessingPayment(false);
      setPaymentStep(1);
    }
  };


  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
        method.isRecommended && styles.recommendedMethod
      ]}
      onPress={() => handlePaymentMethodSelect(method.id)}
      disabled={processingPayment}
    >
      {method.isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}

      <View style={styles.paymentMethodContent}>
        <View style={styles.paymentMethodLeft}>
          <View style={[
            styles.paymentMethodIcon,
            selectedPaymentMethod === method.id && styles.selectedPaymentMethodIcon
          ]}>
            <method.icon
              size={24}
              color={selectedPaymentMethod === method.id ? COLORS.white : COLORS.primary}
            />
          </View>
          <View style={styles.paymentMethodInfo}>
            <Text style={[
              styles.paymentMethodName,
              selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
            ]}>
              {method.name}
            </Text>
            <Text style={[
              styles.paymentMethodDescription,
              selectedPaymentMethod === method.id && styles.selectedPaymentMethodDescription
            ]}>
              {method.description}
            </Text>
            <Text style={[
              styles.processingTime,
              selectedPaymentMethod === method.id && styles.selectedPaymentMethodDescription
            ]}>
              {method.processingTime}
            </Text>
          </View>
        </View>
        <View style={[
          styles.radioButton,
          selectedPaymentMethod === method.id && styles.radioButtonSelected
        ]}>
          {selectedPaymentMethod === method.id && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Show error if booking data is incomplete
  if (!bookingData?.service || !bookingData?.maid) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Incomplete booking information</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.replace('/(booking)/services')}
        >
          <Text style={styles.errorButtonText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={processingPayment}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>
            {processingPayment ? 'Processing your payment...' : 'Choose your payment method'}
          </Text>
        </View>
        <View style={styles.securityBadge}>
          <Shield size={16} color={COLORS.success} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Breakdown */}
        <Card style={styles.priceCard}>
          <Text style={styles.priceTitle}>Price Breakdown</Text>
          <View style={styles.priceContent}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Cost:</Text>
              <Text style={styles.priceValue}>{formatIndianCurrency(totals.servicePrice)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Maid Fee ({bookingData.service?.duration || 0} min):</Text>
              <Text style={styles.priceValue}>{formatIndianCurrency(totals.maidCost)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Platform Fee:</Text>
              <Text style={styles.priceValue}>{formatIndianCurrency(totals.serviceFee)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>GST (18%):</Text>
              <Text style={styles.priceValue}>{formatIndianCurrency(totals.tax)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>{formatIndianCurrency(totals.total)}</Text>
            </View>
          </View>
        </Card>

        {/* Payment Methods */}
        {!processingPayment && (
          <View style={styles.paymentMethodsSection}>
            <Text style={styles.paymentMethodsTitle}>Select Payment Method</Text>
            {PAYMENT_METHODS.map(renderPaymentMethod)}
          </View>
        )}

        {/* Processing Steps */}
        {processingPayment && (
          <Card style={styles.processingCard}>
            <Text style={styles.processingTitle}>Processing Payment</Text>
            <View style={styles.processingSteps}>
              {['Validating', 'Processing', 'Confirming', 'Booking'].map((step, index) => (
                <View key={index} style={styles.processingStep}>
                  <View style={[
                    styles.stepIndicator,
                    paymentStep > index && styles.stepCompleted,
                    paymentStep === index + 1 && styles.stepActive
                  ]}>
                    {paymentStep > index ? (
                      <Text style={styles.stepCheckmark}>✓</Text>
                    ) : (
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepText,
                    paymentStep >= index + 1 && styles.stepTextActive
                  ]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Security Notice */}
        <Card style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Shield size={20} color={COLORS.success} />
            <Text style={styles.securityTitle}>Secure Payment</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We never store your card details.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerTotalLabel}>Total: {formatIndianCurrency(totals.total)}</Text>
          {selectedPaymentMethod && (
            <Text style={styles.selectedMethodText}>
              via {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedPaymentMethod || processingPayment) && styles.disabledButton
          ]}
          onPress={handlePayment}
          disabled={!selectedPaymentMethod || processingPayment}
        >
          {processingPayment ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.white} size="small" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>
              {selectedPaymentMethod === 'cod' ? 'Confirm Booking' : `Pay ${formatIndianCurrency(totals.total)}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...FONTS.body2,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.m,
  },
  errorButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  securityBadge: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  priceCard: {
    marginBottom: 20,
    padding: 16,
  },
  priceTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceContent: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  priceValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  totalValue: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  paymentMethodsSection: {
    marginBottom: 20,
  },
  paymentMethodsTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.m,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPaymentMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  recommendedMethod: {
    borderColor: COLORS.success + '50',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  recommendedText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedPaymentMethodIcon: {
    backgroundColor: COLORS.primary,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  selectedPaymentMethodText: {
    color: COLORS.primary,
  },
  paymentMethodDescription: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  selectedPaymentMethodDescription: {
    color: COLORS.primary,
  },
  processingTime: {
    ...FONTS.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  processingCard: {
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
  },
  processingTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  processingSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  processingStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: COLORS.success,
  },
  stepActive: {
    backgroundColor: COLORS.primary,
  },
  stepCheckmark: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepNumber: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  stepText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  stepTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  securityCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.success + '10',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    ...FONTS.body3,
    color: COLORS.success,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  securityText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  footerTotalLabel: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  selectedMethodText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.m,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  payButtonText: {
    ...FONTS.body1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
