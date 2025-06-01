import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Mail, CheckCircle, ArrowRight, Sparkles, Home, AtSign } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/lib/constants';

const { width, height } = Dimensions.get('window');

const FONTS = {
  extraLarge: { fontSize: 32, fontWeight: '800' },
  large: { fontSize: 24, fontWeight: '700' },
  medium: { fontSize: 18, fontWeight: '600' },
  regular: { fontSize: 16, fontWeight: '400' },
  small: { fontSize: 14, fontWeight: '400' },
};

export default function LoginScreen() {
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { sendOTP } = useAuth();
  const router = useRouter();

  const validateInput = (text: string) => {
    if (authMode === 'phone') {
      const phoneRegex = /^[6-9]\d{9}$/;
      const valid = phoneRegex.test(text);
      setIsValid(valid);
      return valid;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(text);
      setIsValid(valid);
      return valid;
    }
  };

  const handleContinue = async () => {
    if (!validateInput(inputValue)) return;

    try {
      setIsLoading(true);
      
      console.log('📱 Sending OTP to:', inputValue, 'Type:', authMode);
      await sendOTP(inputValue, authMode);

      router.push({
        pathname: '/(auth)/otp',
        params: {
          identifier: inputValue,
          type: authMode
        },
      });

      Alert.alert(
        'Verification Code Sent',
        `A verification code has been sent to your ${authMode}.\n\n🔐 Use OTP: 000000`
      );
    } catch (error: any) {
      console.error('❌ Send OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setInputValue('');
    setIsValid(false);
    setTouched(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fa442a', '#ff6b47', '#fa442a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Home size={40} color={COLORS.white} />
                  <Sparkles size={20} color="#FFD700" style={styles.sparkle} />
                </View>
              </View>
              
              <Text style={styles.welcomeTitle}>Welcome to</Text>
              <Text style={styles.brandName}>MaidEasy</Text>
              <Text style={styles.tagline}>
                Your trusted household help platform
              </Text>
            </View>

            {/* Content Card */}
            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>Sign in to your account</Text>
              
              {/* Auth Mode Toggle */}
              <View style={styles.authModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.authModeButton,
                    authMode === 'phone' && styles.authModeButtonActive,
                  ]}
                  onPress={() => {
                    setAuthMode('phone');
                    resetForm();
                  }}
                  activeOpacity={0.8}
                >
                  <Phone size={20} color={authMode === 'phone' ? COLORS.white : COLORS.primary} />
                  <Text
                    style={[
                      styles.authModeText,
                      authMode === 'phone' && styles.authModeTextActive,
                    ]}
                  >
                    Phone
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.authModeButton,
                    authMode === 'email' && styles.authModeButtonActive,
                  ]}
                  onPress={() => {
                    setAuthMode('email');
                    resetForm();
                  }}
                  activeOpacity={0.8}
                >
                  <AtSign size={20} color={authMode === 'email' ? COLORS.white : COLORS.primary} />
                  <Text
                    style={[
                      styles.authModeText,
                      authMode === 'email' && styles.authModeTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input Section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  {authMode === 'phone' ? 'Mobile Number' : 'Email Address'}
                </Text>
                
                <View
                  style={[
                    styles.inputContainer,
                    touched && inputValue.length > 0 && !isValid && styles.inputError,
                    isValid && styles.inputSuccess,
                  ]}
                >
                  {authMode === 'phone' && (
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                    </View>
                  )}

                  <TextInput
                    style={styles.input}
                    value={inputValue}
                    onChangeText={(text) => {
                      setInputValue(text);
                      validateInput(text);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder={
                      authMode === 'phone'
                        ? 'Enter your mobile number'
                        : 'Enter your email address'
                    }
                    placeholderTextColor="#999"
                    keyboardType={authMode === 'phone' ? 'phone-pad' : 'email-address'}
                    maxLength={authMode === 'phone' ? 10 : 50}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />

                  <View style={styles.inputIcon}>
                    {isValid ? (
                      <CheckCircle size={20} color={COLORS.success} />
                    ) : (
                      <Mail size={20} color="#ccc" />
                    )}
                  </View>
                </View>

                {touched && inputValue.length > 0 && !isValid && (
                  <Text style={styles.errorText}>
                    {authMode === 'phone'
                      ? 'Please enter a valid Indian mobile number'
                      : 'Please enter a valid email address'}
                  </Text>
                )}
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (!isValid || isLoading) && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!isValid || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.white} size="small" />
                    <Text style={styles.loadingText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <ArrowRight size={20} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Helper Text */}
              <View style={styles.helperContainer}>
                <Text style={styles.helperText}>
                  We'll send you a verification code to confirm your {authMode}
                </Text>
              </View>

              {/* OTP Helper */}
              <View style={styles.otpHelper}>
                <Text style={styles.otpHelperText}>
                  🔐 For testing, use OTP: 000000
                </Text>
              </View>

              {/* Terms */}
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sparkle: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  welcomeTitle: {
    ...FONTS.large,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  brandName: {
    ...FONTS.extraLarge,
    color: COLORS.white,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    ...FONTS.regular,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    ...FONTS.large,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 32,
  },
  authModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  authModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  authModeButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  authModeText: {
    ...FONTS.medium,
    color: COLORS.primary,
  },
  authModeTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    ...FONTS.medium,
    color: COLORS.black,
    marginBottom: 12,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#fef2f2',
  },
  inputSuccess: {
    borderColor: COLORS.success,
    backgroundColor: '#f0fdf4',
  },
  countryCode: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  countryCodeText: {
    ...FONTS.regular,
    color: COLORS.black,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    ...FONTS.regular,
    color: COLORS.black,
    height: '100%',
  },
  inputIcon: {
    marginLeft: 12,
  },
  errorText: {
    ...FONTS.small,
    color: COLORS.error,
    marginTop: 8,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    ...FONTS.medium,
    color: COLORS.white,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    ...FONTS.medium,
    color: COLORS.white,
    fontWeight: '600',
  },
  helperContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  helperText: {
    ...FONTS.small,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  otpHelper: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  otpHelperText: {
    ...FONTS.small,
    color: COLORS.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  termsText: {
    ...FONTS.small,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
