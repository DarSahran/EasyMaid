import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RefreshCw, CheckCircle, Phone, Mail } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { soundManager } from '@/lib/soundManager';

const COLORS = {
  white: '#fff',
  black: '#222',
  primary: '#fa442a',
  darkGray: '#666',
  lightGray: '#e5e5e5',
  error: '#FF5A5F',
  success: '#34C759',
  background: '#f8f9fa',
};

const FONTS = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h4: { fontSize: 18, fontWeight: '600' },
  body2: { fontSize: 16 },
  body3: { fontSize: 15 },
  body4: { fontSize: 13 },
};

const SIZES = {
  padding: 16,
  radius: 18,
};

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const inputRefs = useRef<TextInput[]>([]);

  const identifier = params.identifier as string;
  const type = params.type as 'phone' | 'email';

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOTPChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpValue: string) => {
    if (otpValue.length !== 6) return;

    try {
      setLoading(true);
      setError('');
      await soundManager.playSwoosh();

      console.log('Verifying OTP:', otpValue, 'for:', identifier);

      // Check if OTP is correct (static 000000)
      if (otpValue !== '000000') {
        throw new Error('Invalid verification code');
      }

      await soundManager.playSuccess();

      // For now, always treat as new user for demo
      Alert.alert(
        'Welcome to MaidEasy!',
        'Please complete your profile to get started.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(auth)/profile-setup'),
          },
        ]
      );
    } catch (error: any) {
      console.error('OTP verification error:', error);
      await soundManager.playError();
      setError(error.message || 'Invalid verification code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setResendLoading(true);
      await soundManager.playSwoosh();

      console.log('Resending OTP to:', identifier);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset timer
      setTimer(30);
      setCanResend(false);
      setError('');

      Alert.alert('Code Sent', `A new verification code has been sent to your ${type}.`);

      // Restart timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      await soundManager.playError();
      Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskedIdentifier = type === 'phone' 
    ? `+91 ${identifier.slice(0, 2)}****${identifier.slice(-2)}`
    : `${identifier.slice(0, 3)}***@${identifier.split('@')[1]}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          disabled={loading}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify {type === 'phone' ? 'Phone' : 'Email'}</Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.iconContainer}>
          {type === 'phone' ? (
            <Phone size={80} color={COLORS.primary} />
          ) : (
            <Mail size={80} color={COLORS.primary} />
          )}
        </View>

        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to{'\n'}
          <Text style={styles.identifier}>{maskedIdentifier}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                error && styles.otpInputError,
              ]}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
              editable={!loading}
            />
          ))}
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.primary} size="small" />
            <Text style={styles.loadingText}>Verifying...</Text>
          </View>
        )}

        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.timerText}>
              Resend code in {formatTimer(timer)}
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <>
                  <RefreshCw size={16} color={COLORS.primary} />
                  <Text style={styles.resendText}>Resend Code</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.helpText}>
          Didn't receive the code? Check your spam folder or try resending.
        </Text>

        {/* OTP Helper */}
        <View style={styles.otpHelper}>
          <Text style={styles.otpHelperText}>
            🔐 Use OTP: 000000 for verification
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: SIZES.padding * 2,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SIZES.padding * 2,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.padding * 2,
  },
  identifier: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: SIZES.padding * 1.5,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    textAlign: 'center',
    ...FONTS.h2,
    color: COLORS.black,
  },
  otpInputFilled: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  otpInputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  errorText: {
    color: COLORS.error,
    ...FONTS.body4,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  resendContainer: {
    marginBottom: SIZES.padding * 1.5,
    minHeight: 40,
    justifyContent: 'center',
  },
  timerText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary + '20',
  },
  resendText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  helpText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  otpHelper: {
    padding: 12,
    backgroundColor: COLORS.success + '20',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  otpHelperText: {
    ...FONTS.body4,
    color: COLORS.success,
    textAlign: 'center',
    fontWeight: '600',
  },
});
