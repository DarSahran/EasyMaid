import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { soundManager } from '@/lib/soundManager';
import { COLORS, FONTS } from '@/lib/constants';

export default function SoundTester() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sound Tester</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => soundManager.playBookingConfirmed()}
      >
        <Text style={styles.buttonText}>Play Booking Confirmed</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => soundManager.playSuccess()}
      >
        <Text style={styles.buttonText}>Play Success</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => soundManager.playError()}
      >
        <Text style={styles.buttonText}>Play Error</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => soundManager.testSounds()}
      >
        <Text style={styles.buttonText}>Test All Sounds</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
