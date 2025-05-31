import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  pincode?: string;
  role?: string;
  isVerified?: boolean;
  isProfileComplete?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  sendOTP: (identifier: string, type: 'phone' | 'email') => Promise<void>;
  verifyOTP: (identifier: string, otp: string, type: 'phone' | 'email') => Promise<{ isNewUser: boolean }>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
  completeProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app start
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Check if user data exists in local storage
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Create a mock session
        const mockSession = {
          access_token: 'mock_token',
          refresh_token: 'mock_refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: parsedUser.id,
            email: parsedUser.email,
            phone: parsedUser.phone,
          }
        } as Session;
        
        setSession(mockSession);
        console.log('✅ Existing session restored for:', parsedUser.name || parsedUser.email);
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUserId = (identifier: string, type: 'phone' | 'email'): string => {
    // Generate consistent user ID based on identifier
    const prefix = type === 'phone' ? 'phone_' : 'email_';
    const hash = identifier.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return prefix + hash + '_' + Date.now().toString().slice(-6);
  };

  const sendOTP = async (identifier: string, type: 'phone' | 'email') => {
    try {
      setLoading(true);
      
      // Simulate sending OTP (no actual API call)
      console.log(`📱 Sending OTP to ${type}: ${identifier}`);
      console.log('🔐 Static OTP: 000000');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ OTP sent successfully (simulated)');
    } catch (error: any) {
      console.error('❌ Send OTP error:', error);
      throw new Error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const checkUserExists = async (identifier: string, type: 'phone' | 'email'): Promise<AuthUser | null> => {
    try {
      let query = supabase.from('profiles').select('*');
      
      if (type === 'phone') {
        // Clean phone number for comparison
        const cleanPhone = identifier.startsWith('+91') ? identifier : `+91${identifier}`;
        query = query.eq('phone', cleanPhone);
      } else {
        query = query.eq('email', identifier.toLowerCase().trim());
      }
      
      const { data, error } = await query.single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user:', error);
        return null;
      }
      
      if (data) {
        console.log('✅ Existing user found:', data.name || data.email);
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          pincode: data.pincode,
          avatarUrl: data.avatar_url,
          role: data.role || 'customer',
          isVerified: data.is_verified || true,
          isProfileComplete: checkProfileComplete(data),
          createdAt: data.created_at,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      return null;
    }
  };

  const checkProfileComplete = (profile: any): boolean => {
    return !!(
      profile.name && 
      profile.phone && 
      profile.address && 
      profile.city && 
      profile.pincode
    );
  };

  const verifyOTP = async (identifier: string, otp: string, type: 'phone' | 'email'): Promise<{ isNewUser: boolean }> => {
    try {
      setLoading(true);
      
      // Check if OTP is correct (static 000000)
      if (otp !== '000000') {
        throw new Error('Invalid verification code');
      }
      
      console.log('🔐 OTP verified successfully');
      
      // Check if user exists in Supabase
      const existingUser = await checkUserExists(identifier, type);
      
      if (existingUser) {
        // Existing user - load their data
        setUser(existingUser);
        
        // Create mock session
        const mockSession = {
          access_token: 'mock_token_' + Date.now(),
          refresh_token: 'mock_refresh_' + Date.now(),
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            phone: existingUser.phone,
          }
        } as Session;
        
        setSession(mockSession);
        
        // Store user data locally
        await AsyncStorage.setItem('user_data', JSON.stringify(existingUser));
        
        console.log('✅ Existing user signed in:', existingUser.name || existingUser.email);
        return { isNewUser: false };
      } else {
        // New user - create temporary user object
        const newUserId = generateUserId(identifier, type);
        const tempUser: AuthUser = {
          id: newUserId,
          email: type === 'email' ? identifier.toLowerCase().trim() : '',
          phone: type === 'phone' ? (identifier.startsWith('+91') ? identifier : `+91${identifier}`) : '',
          isVerified: true,
          isProfileComplete: false,
          role: 'customer',
        };
        
        setUser(tempUser);
        
        // Create mock session
        const mockSession = {
          access_token: 'mock_token_' + Date.now(),
          refresh_token: 'mock_refresh_' + Date.now(),
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: tempUser.id,
            email: tempUser.email,
            phone: tempUser.phone,
          }
        } as Session;
        
        setSession(mockSession);
        
        // Store temporary user data
        await AsyncStorage.setItem('user_data', JSON.stringify(tempUser));
        
        console.log('✅ New user created (temporary):', tempUser.email || tempUser.phone);
        return { isNewUser: true };
      }
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      throw new Error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (profileData: any) => {
    try {
      if (!user) throw new Error('No user logged in');

      setLoading(true);
      console.log('💾 Saving profile to Supabase:', profileData);

      // Prepare data for Supabase
      const supabaseData = {
        id: user.id,
        name: profileData.name.trim(),
        email: user.email || profileData.email?.toLowerCase().trim(),
        phone: profileData.phone.startsWith('+91') ? profileData.phone : `+91${profileData.phone}`,
        address: profileData.address.trim(),
        city: profileData.city.trim(),
        pincode: profileData.pincode.trim(),
        role: 'customer',
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert new profile into Supabase
      const { data, error } = await supabase
        .from('profiles')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error('Failed to save profile: ' + error.message);
      }

      // Update local user data
      const updatedUser: AuthUser = {
        ...user,
        name: profileData.name,
        phone: supabaseData.phone,
        address: profileData.address,
        city: profileData.city,
        pincode: profileData.pincode,
        isProfileComplete: true,
        createdAt: data.created_at,
      };

      setUser(updatedUser);
      
      // Update local storage
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      console.log('✅ Profile completed and saved to Supabase:', data);
    } catch (error: any) {
      console.error('❌ Complete profile error:', error);
      throw new Error(error.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<AuthUser>) => {
    try {
      if (!user) throw new Error('No user logged in');

      setLoading(true);

      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          pincode: userData.pincode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw new Error('Failed to update profile: ' + error.message);
      }

      // Update local state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update local storage
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      console.log('✅ User profile updated');
    } catch (error: any) {
      console.error('❌ Update user error:', error);
      throw new Error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (!user) return;
      
      // Refresh user data from Supabase
      const refreshedUser = await checkUserExists(
        user.email || user.phone || '', 
        user.email ? 'email' : 'phone'
      );
      
      if (refreshedUser) {
        setUser(refreshedUser);
        await AsyncStorage.setItem('user_data', JSON.stringify(refreshedUser));
        console.log('🔄 User data refreshed');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting sign out process...');

      // Clear local storage
      await AsyncStorage.multiRemove([
        'user_data',
        'booking_data',
        'recent_searches',
        'app_preferences',
      ]);

      // Clear local state
      setUser(null);
      setSession(null);
      
      console.log('✅ Sign out completed successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw new Error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    sendOTP,
    verifyOTP,
    signOut,
    updateUser,
    refreshUser,
    completeProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
