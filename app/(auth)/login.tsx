import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Phone, AtSign, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
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
  h4: { fontSize: 18, fontWeight: '600' },
  body2: { fontSize: 16 },
  body3: { fontSize: 15 },
  body4: { fontSize: 13 },
};

const SIZES = {
  padding: 16,
  radius: 18,
};

const translations = {
  en: {
    'Welcome Back': 'Welcome Back',
    'Sign in to your account': 'Sign in to your account',
    'Phone': 'Phone',
    'Email': 'Email',
    'Mobile Number': 'Mobile Number',
    'Email Address': 'Email Address',
    'Enter your mobile number': 'Enter your mobile number',
    'Enter your email address': 'Enter your email address',
    'Please enter a valid Indian mobile number.': 'Please enter a valid Indian mobile number.',
    'Please enter a valid email address.': 'Please enter a valid email address.',
    'Continue': 'Continue',
    'Continue with Google': 'Continue with Google',
    'OR': 'OR',
    'By continuing, you agree to our': 'By continuing, you agree to our',
    'Terms of Service': 'Terms of Service',
    'and': 'and',
    'Privacy Policy': 'Privacy Policy',
    'Verification Code Sent': 'Verification Code Sent',
    'A verification code has been sent to your': 'A verification code has been sent to your',
  },
  hi: {
    'Welcome Back': 'वापसी पर स्वागत है',
    'Sign in to your account': 'अपने खाते में साइन इन करें',
    'Phone': 'फ़ोन',
    'Email': 'ईमेल',
    'Mobile Number': 'मोबाइल नंबर',
    'Email Address': 'ईमेल पता',
    'Enter your mobile number': 'अपना मोबाइल नंबर दर्ज करें',
    'Enter your email address': 'अपना ईमेल पता दर्ज करें',
    'Please enter a valid Indian mobile number.': 'कृपया मान्य भारतीय मोबाइल नंबर दर्ज करें।',
    'Please enter a valid email address.': 'कृपया मान्य ईमेल पता दर्ज करें।',
    'Continue': 'जारी रखें',
    'Continue with Google': 'Google से जारी रखें',
    'OR': 'या',
    'By continuing, you agree to our': 'जारी रखते हुए, आप हमारी',
    'Terms of Service': 'सेवा की शर्तें',
    'and': 'और',
    'Privacy Policy': 'गोपनीयता नीति',
    'Verification Code Sent': 'सत्यापन कोड भेजा गया',
    'A verification code has been sent to your': 'आपके पास एक सत्यापन कोड भेजा गया है',
  },
};

const TranslationContext = React.createContext({
  t: (key: string) => key,
  language: 'en',
  setLanguage: (lang: string) => {},
});

function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const t = (key: string) => translations[language][key] || key;

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

const useTranslation = () => React.useContext(TranslationContext);

const loginImage = require('@/assets/images/login_image.jpeg');

function LoginScreen() {
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();

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
    setError('');
    if (!validateInput(inputValue)) return;

    try {
      setIsLoading(true);
      await soundManager.playSwoosh();

      console.log('Sending OTP to:', inputValue, 'Type:', authMode);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Navigating to OTP screen...');
      router.push({
        pathname: '/(auth)/otp',
        params: {
          identifier: inputValue,
          type: authMode
        },
      });

      // Show success message
      Alert.alert(
        t('Verification Code Sent'),
        `${t('A verification code has been sent to your')} ${authMode}.\n\n🔐 Use OTP: 000000`
      );
    } catch (error) {
      console.error('Send OTP error:', error);
      await soundManager.playError();
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await soundManager.playSwoosh();
      Alert.alert('Coming Soon', 'Google authentication will be available soon!');
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    }
  };

  const handleLanguageToggle = async () => {
    await soundManager.playSwoosh();
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const resetForm = () => {
    setInputValue('');
    setIsValid(false);
    setTouched(false);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image source={loginImage} style={styles.logo} resizeMode="cover" />
          <View style={styles.overlay} />
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>{t('Welcome Back')}</Text>
            <Text style={styles.subtitleText}>{t('Sign in to your account')}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.authModeToggle}>
            <TouchableOpacity
              style={[
                styles.authModeBtn,
                authMode === 'phone' ? styles.authModeBtnActive : null,
              ]}
              onPress={() => {
                setAuthMode('phone');
                resetForm();
              }}
              activeOpacity={0.8}
            >
              <Phone size={18} color={authMode === 'phone' ? COLORS.white : COLORS.darkGray} />
              <Text
                style={[
                  styles.authModeBtnText,
                  authMode === 'phone' ? styles.authModeBtnTextActive : null,
                ]}
              >
                {t('Phone')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.authModeBtn,
                authMode === 'email' ? styles.authModeBtnActive : null,
              ]}
              onPress={() => {
                setAuthMode('email');
                resetForm();
              }}
              activeOpacity={0.8}
            >
              <AtSign size={18} color={authMode === 'email' ? COLORS.white : COLORS.darkGray} />
              <Text
                style={[
                  styles.authModeBtnText,
                  authMode === 'email' ? styles.authModeBtnTextActive : null,
                ]}
              >
                {t('Email')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              {authMode === 'phone' ? t('Mobile Number') : t('Email Address')}
            </Text>
            <View
              style={[
                styles.inputContainer,
                touched && inputValue.length > 0 && !isValid
                  ? styles.inputError
                  : null,
                isValid ? styles.inputSuccess : null,
              ]}
            >
              {authMode === 'phone' && (
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
              )}

              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={(text) => {
                  setInputValue(text);
                  validateInput(text);
                  setError('');
                }}
                onBlur={() => setTouched(true)}
                placeholder={
                  authMode === 'phone'
                    ? t('Enter your mobile number')
                    : t('Enter your email address')
                }
                placeholderTextColor={COLORS.darkGray}
                keyboardType={authMode === 'phone' ? 'phone-pad' : 'email-address'}
                maxLength={authMode === 'phone' ? 10 : 50}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              <View style={styles.inputIconContainer}>
                {isValid && (
                  <CheckCircle size={20} color={COLORS.success} />
                )}
                {!isValid && (
                  <>
                    {authMode === 'phone' && (
                      <Phone size={18} color={COLORS.darkGray} />
                    )}
                    {authMode === 'email' && (
                      <Mail size={18} color={COLORS.darkGray} />
                    )}
                  </>
                )}
              </View>
            </View>

            {touched && inputValue.length > 0 && !isValid && (
              <Text style={styles.errorText}>
                {authMode === 'phone'
                  ? t('Please enter a valid Indian mobile number.')
                  : t('Please enter a valid email address.')}
              </Text>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, (!isValid || isLoading) && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!isValid || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.loadingText}>Sending...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t('Continue')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('OR')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Mail size={20} color={COLORS.primary} />
            <Text style={styles.googleButtonText}>{t('Continue with Google')}</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            {t('By continuing, you agree to our')}{' '}
            <Text style={styles.termsLink}>{t('Terms of Service')}</Text>{' '}
            {t('and')}{' '}
            <Text style={styles.termsLink}>{t('Privacy Policy')}</Text>
          </Text>

          <View style={styles.languageToggleBottom}>
            <TouchableOpacity style={styles.langBtn} onPress={handleLanguageToggle}>
              <Text style={[styles.langText, language === 'en' && styles.langActive]}>
                EN
              </Text>
              <Text style={styles.langDivider}>|</Text>
              <Text style={[styles.langText, language === 'hi' && styles.langActive]}>
                हि
              </Text>
            </TouchableOpacity>
          </View>

          {/* OTP Helper */}
          <View style={styles.otpHelper}>
            <Text style={styles.otpHelperText}>
              🔐 Use OTP: 000000 for verification
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  welcomeText: {
    ...FONTS.h1,
    color: COLORS.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitleText: {
    ...FONTS.body2,
    color: COLORS.white,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 1.5,
    borderTopRightRadius: SIZES.radius * 1.5,
    marginTop: -20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  authModeToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: SIZES.padding * 1.5,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    padding: 4,
  },
  authModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: SIZES.radius - 4,
    backgroundColor: 'transparent',
  },
  authModeBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  authModeBtnText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginLeft: 8,
    fontWeight: '600',
  },
  authModeBtnTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: SIZES.padding * 1.5,
  },
  inputLabel: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: SIZES.padding,
    ...FONTS.body2,
    color: COLORS.black,
    backgroundColor: 'transparent',
  },
  countryCode: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: SIZES.radius - 2,
    borderBottomLeftRadius: SIZES.radius - 2,
    borderRightWidth: 1,
    borderRightColor: COLORS.lightGray,
  },
  countryCodeText: {
    ...FONTS.body2,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  inputIconContainer: {
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '05',
  },
  inputSuccess: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '05',
  },
  errorText: {
    color: COLORS.error,
    ...FONTS.body4,
    marginTop: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding + 2,
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    ...FONTS.h4,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.h4,
    color: COLORS.white,
    marginLeft: 8,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.padding,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginHorizontal: SIZES.padding,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding + 2,
    marginBottom: SIZES.padding,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 12,
  },
  termsText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  languageToggleBottom: {
    alignItems: 'center',
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  langText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    fontWeight: 'bold',
  },
  langActive: {
    color: COLORS.primary,
  },
  langDivider: {
    color: COLORS.darkGray,
    marginHorizontal: 8,
    fontWeight: 'bold',
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

export default function WrappedLoginScreen() {
  return (
    <TranslationProvider>
      <LoginScreen />
    </TranslationProvider>
  );
}
