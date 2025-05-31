import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, MessageSquare, Navigation, Plus } from 'lucide-react-native';
import * as Location from 'expo-location';
import { COLORS, FONTS, RADIUS, formatIndianCurrency } from '@/lib/constants';
import { useBooking } from '@/context/BookingContext';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function AddressScreen() {
  const router = useRouter();
  const { bookingData, setBookingAddress } = useBooking();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [savedAddresses] = useState([
    '123 Bandra West, Mumbai, Maharashtra 400050',
    '456 Koramangala, Bangalore, Karnataka 560034',
    '789 CP, New Delhi, Delhi 110001',
  ]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to get your current address');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.name || addr.street || ''}, ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`.replace(/^,\s*/, '');
        setCurrentLocation(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setAddress(currentLocation);
    } else {
      getCurrentLocation();
    }
  };

  const handleUseSavedAddress = (savedAddress: string) => {
    setAddress(savedAddress);
  };

  const handleContinue = () => {
    if (!address.trim()) {
      Alert.alert('Missing Information', 'Please enter your service address');
      return;
    }
    
    if (address.trim().length < 10) {
      Alert.alert('Invalid Address', 'Please enter a complete address');
      return;
    }
    
    setBookingAddress(address.trim(), notes.trim());
    router.push('/(booking)/payment');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Service Address</Text>
          <Text style={styles.headerSubtitle}>Where should we provide the service?</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>{bookingData.service?.name || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Maid:</Text>
              <Text style={styles.summaryValue}>{bookingData.maid?.name || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>
                {bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Not selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>{bookingData.time || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryPrice}>
                {formatIndianCurrency(bookingData.service?.price || 0)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Current Location */}
        <Card style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Navigation size={20} color={COLORS.primary} />
            <Text style={styles.locationTitle}>Use Current Location</Text>
          </View>
          {locationLoading ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.locationLoadingText}>Getting your location...</Text>
            </View>
          ) : currentLocation ? (
            <View>
              <Text style={styles.currentLocationText}>{currentLocation}</Text>
              <TouchableOpacity
                style={styles.useLocationButton}
                onPress={handleUseCurrentLocation}
              >
                <Text style={styles.useLocationButtonText}>Use This Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.getLocationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.getLocationButtonText}>Get Current Location</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Saved Addresses */}
        <Card style={styles.savedAddressesCard}>
          <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>
          {savedAddresses.map((savedAddress, index) => (
            <TouchableOpacity
              key={index}
              style={styles.savedAddressItem}
              onPress={() => handleUseSavedAddress(savedAddress)}
            >
              <MapPin size={16} color={COLORS.textSecondary} />
              <Text style={styles.savedAddressText}>{savedAddress}</Text>
              <Plus size={16} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Manual Address Input */}
        <View style={styles.section}>
          <Input
            label="Service Address *"
            placeholder="Enter your complete address with pincode"
            value={address}
            onChangeText={setAddress}
            leftIcon={<MapPin color={COLORS.textSecondary} size={20} />}
            multiline
            numberOfLines={3}
            style={styles.addressInput}
          />
        </View>

        {/* Notes Input */}
        <View style={styles.section}>
          <Input
            label="Special Instructions (Optional)"
            placeholder="Any special instructions for the service provider..."
            value={notes}
            onChangeText={setNotes}
            leftIcon={<MessageSquare color={COLORS.textSecondary} size={20} />}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Address Guidelines */}
        <Card style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Address Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Include building name/number{'\n'}
            • Mention floor and apartment number{'\n'}
            • Add nearby landmarks{'\n'}
            • Include pincode for accurate location
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !address.trim() && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!address.trim()}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    marginBottom: 20,
    padding: 16,
  },
  summaryTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  summaryPrice: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  locationCard: {
    marginBottom: 20,
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLoadingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  currentLocationText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  useLocationButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.s,
    alignSelf: 'flex-start',
  },
  useLocationButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  getLocationButton: {
    backgroundColor: COLORS.primary + '20',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.s,
    alignItems: 'center',
  },
  getLocationButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  savedAddressesCard: {
    marginBottom: 20,
    padding: 16,
  },
  savedAddressesTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  savedAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  savedAddressText: {
    ...FONTS.body3,
    color: COLORS.text,
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  section: {
    marginBottom: 20,
  },
  addressInput: {
    minHeight: 80,
  },
  guidelinesCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.primary + '10',
  },
  guidelinesTitle: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  guidelinesText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.m,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  continueButtonText: {
    ...FONTS.body1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
