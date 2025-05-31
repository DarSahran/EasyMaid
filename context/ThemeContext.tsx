import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightTheme = {
  colors: {
    primary: '#fa442a',
    secondary: '#f97316',
    success: '#22c55e',
    error: '#FF5A5F',
    warning: '#f59e0b',
    background: '#f8f9fa',
    card: '#ffffff',
    surface: '#ffffff',
    text: '#222222',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#e5e5e5',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' as const, lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: 'bold' as const, lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
    body1: { fontSize: 18, lineHeight: 26 },
    body2: { fontSize: 16, lineHeight: 24 },
    body3: { fontSize: 14, lineHeight: 20 },
    caption: { fontSize: 12, lineHeight: 16 },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    card: '#1e1e1e',
    surface: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    textTertiary: '#808080',
    border: '#333333',
    shadow: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(255, 255, 255, 0.1)',
  },
};

interface ThemeContextType {
  theme: typeof lightTheme;
  colors: typeof lightTheme.colors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = async (theme: 'light' | 'dark') => {
    const newIsDark = theme === 'dark';
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem('theme_preference', theme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const currentTheme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        colors: currentTheme.colors,
        isDark,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
