import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { soundManager } from '@/lib/soundManager';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await soundManager.playSuccess();
      
      // Update user data
      await updateUser(formData);
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      await soundManager.playError();
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Save size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.avatarCard}>
          <View style={styles.avatarSection}>
            <Image
              source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarText}>Tap to change profile photo</Text>
        </Card>

        <Card style={styles.formCard}>
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter your full name"
          />
          
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          
          <Input
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          
          <Input
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Enter your address"
            multiline
          />
          
          <Input
            label="City"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            placeholder="Enter your city"
          />
          
          <Input
            label="Pincode"
            value={formData.pincode}
            onChangeText={(text) => setFormData({ ...formData, pincode: text })}
            placeholder="Enter your pincode"
            keyboardType="numeric"
          />
        </Card>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  formCard: {
    padding: 20,
    gap: 16,
  },
});
