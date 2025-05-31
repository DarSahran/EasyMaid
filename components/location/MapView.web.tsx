// For Web - Simple fallback component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '@/lib/constants';

interface MapViewProps {
  style?: any;
  initialRegion?: any;
  onPress?: (event: any) => void;
  children?: React.ReactNode;
}

export const MapView: React.FC<MapViewProps> = ({ style, children, ...props }) => {
  return (
    <View style={[styles.mapPlaceholder, style]}>
      <Text style={styles.placeholderText}>
        🗺️ Map View
      </Text>
      <Text style={styles.subText}>
        (Web version - use mobile app for interactive map)
      </Text>
      {children}
    </View>
  );
};

export const Marker: React.FC<any> = ({ children }) => {
  return (
    <View style={styles.marker}>
      📍
      {children}
    </View>
  );
};

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const styles = StyleSheet.create({
  mapPlaceholder: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 200,
  },
  placeholderText: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 8,
  },
  subText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  marker: {
    fontSize: 20,
  },
});
