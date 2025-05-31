import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, User, Mail, Phone, Upload, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS, RADIUS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('User data:', user);
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUri(user.avatarUrl || null);
    }
  }, [user]);

  const selectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadAvatar = async (uri: string): Promise<string | null> => {
    try {
      const userId = user?.id || crypto.randomUUID();
      const fileName = `${userId}-${Date.now()}.jpg`;
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  // FIXED: Profile save with direct navigation to home
  const handleSubmit = async () => {
    console.log('=== SUBMIT BUTTON CLICKED ===');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Starting profile submission...');
      
      let avatarUrl = null;
      
      if (avatarUri && avatarUri !== user?.avatarUrl) {
        console.log('Uploading avatar...');
        avatarUrl = await uploadAvatar(avatarUri);
        if (avatarUrl) {
          console.log('Avatar uploaded successfully:', avatarUrl);
        }
      }
      
      // Use AuthContext updateProfile method
      const success = await updateProfile({
        name: name.trim(),
        email: email.trim() || '',
        phone: phone.trim(),
        avatarUrl,
      });
      
      if (success) {
        console.log('Profile updated successfully, navigating to home...');
        
        // Navigate directly to home screen (index)
        router.replace('/(tabs)');
        
        // Show welcome message after navigation
        setTimeout(() => {
          Alert.alert(
            'Welcome to MaidEasy! 🎉',
            `Hello ${name.split(' ')[0]}! Your profile has been set up successfully. You can now book services.`,
            [{ text: 'Get Started!', style: 'default' }]
          );
        }, 500);
      } else {
        throw new Error('Profile update failed');
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('=== SKIP BUTTON CLICKED ===');
    Alert.alert(
      'Skip Profile Setup?',
      'You can complete your profile later from the settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => {
            console.log('Skipping to home...');
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const getProfileInitial = () => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Let us know a bit about you</Text>
        </View>
        
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{getProfileInitial()}</Text>
            </View>
          )}
          
          <View style={styles.avatarButtons}>
            <TouchableOpacity style={styles.avatarButton} onPress={takePhoto}>
              <Camera color={COLORS.primary} size={20} />
              <Text style={styles.avatarButtonText}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.avatarButton} onPress={selectImage}>
              <Upload color={COLORS.primary} size={20} />
              <Text style={styles.avatarButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Full Name *"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            leftIcon={<User color={COLORS.textSecondary} size={20} />}
            error={errors.name}
            autoCapitalize="words"
          />
          
          <Input
            label="Email (Optional)"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon={<Mail color={COLORS.textSecondary} size={20} />}
            error={errors.email}
            autoCapitalize="none"
          />
          
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone color={COLORS.textSecondary} size={20} />}
            error={errors.phone}
            editable={!user?.phone}
          />
          
          <TouchableOpacity
            style={[
              styles.saveButton, 
              (!name.trim() || isLoading) && styles.saveButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!name.trim() || isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    ...FONTS.h1,
    color: COLORS.white,
    fontSize: 48,
    fontWeight: 'bold',
  },
  avatarButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.s,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  avatarButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.m,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 12,
  },
  skipButtonText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
