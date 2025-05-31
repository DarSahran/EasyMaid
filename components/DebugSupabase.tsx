import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

export const DebugSupabase = () => {
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
        Alert.alert('Connection Error', error.message);
      } else {
        console.log('Supabase connection successful:', data);
        Alert.alert('Success', 'Supabase connection working!');
      }
    } catch (error) {
      console.error('Test error:', error);
      Alert.alert('Test Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity
        onPress={testConnection}
        disabled={testing}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {testing ? 'Testing...' : 'Test Supabase Connection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
