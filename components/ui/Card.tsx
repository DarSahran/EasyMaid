import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevation?: 'small' | 'medium' | 'large' | 'none';
  padding?: boolean;
}

export function Card({ 
  children, 
  style, 
  elevation = 'small',
  padding = true 
}: CardProps) {
  const shadowStyle = elevation !== 'none' ? SHADOWS[elevation] : {};
  
  return (
    <View style={[
      styles.card, 
      shadowStyle,
      padding ? styles.padding : null,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.m,
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
});

export default Card;