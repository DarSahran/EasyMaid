// Remove any ws imports and use fetch for HTTP requests
import { Audio } from 'expo-av';

// Use fetch for API calls instead of WebSocket
export const speechToText = async (audioUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    } as any);

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Speech to text error:', error);
    throw error;
  }
};
