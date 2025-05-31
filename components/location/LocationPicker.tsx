import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Platform-specific imports
import { MapView, Marker, Region } from './MapView';

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  initialAddress?: string;
}

export function LocationPicker({ onLocationSelect, initialAddress = '' }: LocationPickerProps) {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState(initialAddress);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        if (initialAddress === '') {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          
          if (geocode && geocode.length > 0) {
            const loc = geocode[0];
            const formattedAddress = `${loc.street || ''}, ${loc.city || ''}, ${loc.region || ''}, ${loc.postalCode || ''}`;
            setAddress(formattedAddress);
            
            onLocationSelect({
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              address: formattedAddress,
            });
          }
        }
      } catch (error) {
        setErrorMsg('Could not fetch location');
        console.error(error);
      }
    })();
  }, [initialAddress]);

  const handleAddressChange = (text: string) => {
    setAddress(text);
  };

  const handleConfirmLocation = () => {
    if (location) {
      onLocationSelect({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      });
    }
  };

  const handleMapPress = (event: any) => {
    if (Platform.OS !== 'web' && event.nativeEvent) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setLocation({
        ...location,
        coords: { ...location.coords, latitude, longitude },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Service Location</Text>
      
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <>
          {location && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={handleMapPress}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                />
              </MapView>
              {Platform.OS !== 'web' && (
                <Text style={styles.mapInstructions}>
                  Tap on the map to adjust your location
                </Text>
              )}
            </View>
          )}
          
          <Input
            value={address}
            onChangeText={handleAddressChange}
            placeholder="Enter your address"
            multiline
          />
        </>
      )}
      
      <Button title="Confirm Location" onPress={handleConfirmLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    ...FONTS.h3,
    marginBottom: 16,
  },
  mapContainer: {
    height: 250,
    marginBottom: 16,
    borderRadius: RADIUS.m,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapInstructions: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: RADIUS.s,
    color: COLORS.card,
    textAlign: 'center',
    ...FONTS.body3,
  },
  errorText: {
    ...FONTS.body2,
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default LocationPicker;
