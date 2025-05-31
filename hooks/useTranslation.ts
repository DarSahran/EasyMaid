import { useContext } from 'react';
import { useLanguage } from '../context/LanguageContext';

// In your translation files
const translations = {
  en: {
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
  },
  hi: {
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
  },
};


export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { t };
};
