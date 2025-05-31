import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useTheme } from '@/context/ThemeContext';

export default function VoiceBooking() {
  const { colors } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to use voice booking.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      // For demo purposes, simulate voice command processing
      Speech.speak('Voice command received. Processing your booking request.', {
        language: 'en',
      });

      Alert.alert(
        'Voice Command Processed',
        'Your voice booking request has been processed. This feature will be enhanced with AI in the next update.',
        [{ text: 'OK' }]
      );

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handleVoicePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.voiceButton,
          { 
            backgroundColor: isRecording ? colors.error : colors.card,
            borderColor: isRecording ? colors.error : colors.primary,
          }
        ]}
        onPress={handleVoicePress}
        activeOpacity={0.8}
      >
        {isRecording ? (
          <MicOff size={24} color={colors.card} />
        ) : (
          <Mic size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
      
      <View style={styles.textContainer}>
        <Text style={[styles.voiceText, { color: colors.card }]}>
          {isRecording ? 'Listening...' : 'Voice Book'}
        </Text>
        <Text style={[styles.voiceSubtext, { color: colors.card }]}>
          {isRecording ? 'Tap to stop' : 'Tap to speak'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 8,
    marginTop: 8,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  voiceText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  voiceSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
});
