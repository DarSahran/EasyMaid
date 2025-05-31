import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class SoundManager {
  private sounds: { [key: string]: Audio.Sound } = {};
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  async initializeSounds() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔊 Initializing Sound Manager...');
      
      // Set audio mode for optimal playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });

      // Load your actual sound files
      await this.loadSound('booking-confirmed', require('../assets/sounds/booking-confirmed.mp3'));
      await this.loadSound('error', require('../assets/sounds/error.mp3'));
      await this.loadSound('success', require('../assets/sounds/success.mp3'));

      this.isInitialized = true;
      console.log('✅ Sound Manager initialized with real audio files');
    } catch (error) {
      console.error('❌ Failed to initialize Sound Manager:', error);
      this.isInitialized = false;
    }
  }

  private async loadSound(name: string, source: any) {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume: 0.8,
        rate: 1.0,
        shouldCorrectPitch: true,
      });
      
      this.sounds[name] = sound;
      console.log(`✅ Loaded sound file: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to load sound ${name}:`, error);
    }
  }

  private async playSound(soundName: string, volume: number = 0.8) {
    if (!this.isEnabled || !this.isInitialized) {
      console.log(`🔇 Sound disabled or not initialized: ${soundName}`);
      return;
    }

    try {
      const sound = this.sounds[soundName];
      if (sound) {
        // Reset to beginning and set volume
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(volume);
        
        // Play the actual sound file
        await sound.playAsync();
        console.log(`🔊 Playing actual sound file: ${soundName}`);
      } else {
        console.warn(`⚠️ Sound file not found: ${soundName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to play sound ${soundName}:`, error);
    }
  }

  // Public methods that play your actual audio files
  async playBookingConfirmed() {
    await this.playSound('booking-confirmed', 0.9);
  }

  async playSuccess() {
    await this.playSound('success', 0.8);
  }

  async playError() {
    await this.playSound('error', 0.7);
  }

  async playSwoosh() {
    // Use success sound for swoosh effect
    await this.playSound('success', 0.6);
  }

  enableSounds() {
    this.isEnabled = true;
    console.log('🔊 Sounds enabled');
  }

  disableSounds() {
    this.isEnabled = false;
    console.log('🔇 Sounds disabled');
  }

  async stopAllSounds() {
    try {
      for (const [name, sound] of Object.entries(this.sounds)) {
        await sound.stopAsync();
        console.log(`⏹️ Stopped sound: ${name}`);
      }
    } catch (error) {
      console.error('❌ Failed to stop sounds:', error);
    }
  }

  async cleanup() {
    try {
      console.log('🗑️ Cleaning up Sound Manager...');
      
      for (const [name, sound] of Object.entries(this.sounds)) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
          console.log(`🗑️ Unloaded sound file: ${name}`);
        } catch (error) {
          console.error(`❌ Failed to unload sound ${name}:`, error);
        }
      }
      
      this.sounds = {};
      this.isInitialized = false;
      console.log('✅ Sound Manager cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup Sound Manager:', error);
    }
  }
}

export const soundManager = new SoundManager();
