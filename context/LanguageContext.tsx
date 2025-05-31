import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation data
const translations = {
  en: {
    // Authentication
    'Welcome to MaidEasy': 'Welcome to MaidEasy',
    'Book household help in minutes': 'Book household help in minutes',
    'Phone': 'Phone',
    'Email': 'Email',
    'Mobile Number': 'Mobile Number',
    'Email Address': 'Email Address',
    'Enter your mobile number': 'Enter your mobile number',
    'Enter your email address': 'Enter your email address',
    'Please enter a valid Indian mobile number.': 'Please enter a valid Indian mobile number.',
    'Please enter a valid email address.': 'Please enter a valid email address.',
    'Continue with Phone': 'Continue with Phone',
    'Continue with Email': 'Continue with Email',
    'Continue with Google': 'Continue with Google',
    'OR': 'OR',
    'By continuing, you agree to our': 'By continuing, you agree to our',
    'Terms of Service': 'Terms of Service',
    'and': 'and',
    'Privacy Policy': 'Privacy Policy',
    
    // OTP Screen
    'Enter Verification Code': 'Enter Verification Code',
    'We have sent a 6-digit code to': 'We have sent a 6-digit code to',
    'Verify Code': 'Verify Code',
    'Resend': 'Resend',
    'Resend in': 'Resend in',
    "Didn't receive the code?": "Didn't receive the code?",
    
    // Profile Setup
    'Complete Your Profile': 'Complete Your Profile',
    'Let us know a bit about you': 'Let us know a bit about you',
    'Full Name': 'Full Name',
    'Save Profile': 'Save Profile',
    'Skip for now': 'Skip for now',
    'Camera': 'Camera',
    'Gallery': 'Gallery',
    
    // Navigation
    'Home': 'Home',
    'Bookings': 'Bookings',
    'History': 'History',
    'Profile': 'Profile',
    
    // Home Screen
    'Hello': 'Hello',
    'Select location': 'Select location',
    'Search for services...': 'Search for services...',
    'Our Services': 'Our Services',
    'Top Rated Maids': 'Top Rated Maids',
    'See All': 'See All',
    'Book Now': 'Book Now',
    
    // Common
    'Loading...': 'Loading...',
    'Error': 'Error',
    'Success': 'Success',
    'Cancel': 'Cancel',
    'OK': 'OK',
    'Yes': 'Yes',
    'No': 'No',
    'Save': 'Save',
    'Edit': 'Edit',
    'Delete': 'Delete',
    'Back': 'Back',
    'Next': 'Next',
    'Done': 'Done',
    'Continue': 'Continue',
  },
  hi: {
    // Authentication
    'Welcome to MaidEasy': 'मेडईज़ी में आपका स्वागत है',
    'Book household help in minutes': 'मिनटों में घरेलू मदद बुक करें',
    'Phone': 'फ़ोन',
    'Email': 'ईमेल',
    'Mobile Number': 'मोबाइल नंबर',
    'Email Address': 'ईमेल पता',
    'Enter your mobile number': 'अपना मोबाइल नंबर दर्ज करें',
    'Enter your email address': 'अपना ईमेल पता दर्ज करें',
    'Please enter a valid Indian mobile number.': 'कृपया मान्य भारतीय मोबाइल नंबर दर्ज करें।',
    'Please enter a valid email address.': 'कृपया मान्य ईमेल पता दर्ज करें।',
    'Continue with Phone': 'फ़ोन से जारी रखें',
    'Continue with Email': 'ईमेल से जारी रखें',
    'Continue with Google': 'Google से जारी रखें',
    'OR': 'या',
    'By continuing, you agree to our': 'जारी रखते हुए, आप हमारी',
    'Terms of Service': 'सेवा की शर्तें',
    'and': 'और',
    'Privacy Policy': 'गोपनीयता नीति',
    
    // OTP Screen
    'Enter Verification Code': 'सत्यापन कोड दर्ज करें',
    'We have sent a 6-digit code to': 'हमने 6-अंकीय कोड भेजा है',
    'Verify Code': 'कोड सत्यापित करें',
    'Resend': 'पुनः भेजें',
    'Resend in': 'में पुनः भेजें',
    "Didn't receive the code?": 'कोड प्राप्त नहीं हुआ?',
    
    // Profile Setup
    'Complete Your Profile': 'अपनी प्रोफ़ाइल पूरी करें',
    'Let us know a bit about you': 'हमें अपने बारे में बताएं',
    'Full Name': 'पूरा नाम',
    'Save Profile': 'प्रोफ़ाइल सेव करें',
    'Skip for now': 'अभी के लिए छोड़ें',
    'Camera': 'कैमरा',
    'Gallery': 'गैलरी',
    
    // Navigation
    'Home': 'होम',
    'Bookings': 'बुकिंग',
    'History': 'इतिहास',
    'Profile': 'प्रोफ़ाइल',
    
    // Home Screen
    'Hello': 'नमस्ते',
    'Select location': 'स्थान चुनें',
    'Search for services...': 'सेवाओं की खोज करें...',
    'Our Services': 'हमारी सेवाएं',
    'Top Rated Maids': 'टॉप रेटेड मेड',
    'See All': 'सभी देखें',
    'Book Now': 'अभी बुक करें',
    
    // Common
    'Loading...': 'लोड हो रहा है...',
    'Error': 'त्रुटि',
    'Success': 'सफलता',
    'Cancel': 'रद्द करें',
    'OK': 'ठीक है',
    'Yes': 'हाँ',
    'No': 'नहीं',
    'Save': 'सेव करें',
    'Edit': 'संपादित करें',
    'Delete': 'हटाएं',
    'Back': 'वापस',
    'Next': 'अगला',
    'Done': 'पूर्ण',
    'Continue': 'जारी रखें',
  },
};

interface LanguageContextType {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'hi'>('en');

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const setLanguage = async (lang: 'en' | 'hi') => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
      console.log(`Language changed to: ${lang}`);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// For backward compatibility, also export as useTranslation
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
