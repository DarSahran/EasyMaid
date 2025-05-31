import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Home, Edit3 } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/lib/constants';
import { useBooking } from '@/context/BookingContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LocationPicker from '@/components/location/LocationPicker';

export default function LocationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { bookingDetails, setBookingDetails, selectedService } = useBooking();
  
  // Initialize with current booking details or defaults
  const [address, setAddress] = useState(bookingDetails.address || '');
  const [notes, setNotes] = useState(bookingDetails.notes || '');
  const [showLocationPicker, setShowLocationPicker] = useState(!bookingDetails.address);
  
  // Handle location selection
  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setAddress(location.address);
    setShowLocationPicker(false);
  };
  
  // Toggle location picker
  const toggleLocationPicker = () => {
    setShowLocationPicker(!showLocationPicker);
  };
  
  // Continue to confirmation screen
  const handleContinue = () => {
    if (!address.trim()) {
      alert('Please provide a service address');
      return;
    }
    
    setBookingDetails({
      ...bookingDetails,
      address,
      notes
    });
    
    router.push('/booking/confirmation');
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Location</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {selectedService && (
          <Card style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>{selectedService.name}</Text>
            <Text style={styles.serviceDetails}>
              {new Date(bookingDetails.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })} at {formatTime(bookingDetails.time)}
            </Text>
            {bookingDetails.recurring && (
              <Text style={styles.recurringText}>
                Recurring: {bookingDetails.frequency === 'weekly' ? 'Weekly' : 
                            bookingDetails.frequency === 'biweekly' ? 'Every two weeks' : 'Monthly'}
              </Text>
            )}
          </Card>
        )}
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Home size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Service Address</Text>
            
            {!showLocationPicker && address && (
              <TouchableOpacity
                onPress={toggleLocationPicker}
                style={styles.editButton}
              >
                <Edit3 size={16} color={COLORS.primary} />
                <Text style={styles.editButtonText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {showLocationPicker ? (
            <LocationPicker 
              onLocationSelect={handleLocationSelect} 
              initialAddress={address}
            />
          ) : (
            <Card>
              <Text style={styles.addressText}>{address}</Text>
            </Card>
          )}
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.inputLabel}>Special Instructions</Text>
          <Input
            placeholder="Add notes for service provider (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            inputStyle={styles.notesInput}
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!address.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// Helper function to format time
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  serviceCard: {
    marginBottom: 24,
  },
  serviceTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceDetails: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  recurringText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
  },
  addressText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  inputLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...Platform.select({
      ios: {
        paddingBottom: 32,
      },
    }),
  },
});