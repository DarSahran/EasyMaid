import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, MessageCircle, Navigation, Clock, MapPin, Star } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS } from '@/lib/constants';
import Card from '@/components/ui/Card';

export default function TrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [maidStatus, setMaidStatus] = useState('On the way');
  const [distance, setDistance] = useState('2.3 km');

  useEffect(() => {
    // Simulate countdown
    const interval = setInterval(() => {
      setEstimatedTime(prev => {
        const newTime = Math.max(1, prev - 1);
        if (newTime <= 5 && newTime > 1) {
          setMaidStatus('Almost there');
        } else if (newTime === 1) {
          setMaidStatus('Arrived');
        }
        return newTime;
      });

      // Update distance
      const distances = ['2.1 km', '1.8 km', '1.5 km', '1.2 km', '0.8 km', '0.5 km', '0.2 km'];
      setDistance(distances[Math.floor(Math.random() * distances.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    Alert.alert('Call Maid', 'Would you like to call your maid?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling maid...') }
    ]);
  };

  const handleMessage = () => {
    Alert.alert('Message Maid', 'Send a message to your maid?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', onPress: () => console.log('Opening messages...') }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Track Your Maid</Text>
          <Text style={styles.headerSubtitle}>{params.maidName}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton}>
          <Navigation size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Web Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapPlaceholderContent}>
            <MapPin size={80} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderTitle}>Live Tracking</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Your maid is {distance} away
            </Text>
            <View style={styles.locationIndicators}>
              <View style={styles.locationIndicator}>
                <View style={[styles.locationDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.locationLabel}>Maid Location</Text>
              </View>
              <View style={styles.locationIndicator}>
                <View style={[styles.locationDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.locationLabel}>Your Location</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Floating ETA Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaContent}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={styles.etaText}>{estimatedTime} min</Text>
            <Text style={styles.etaLabel}>ETA</Text>
          </View>
        </View>
      </View>

      {/* Maid Info Card */}
      <Card style={styles.maidInfoCard}>
        <View style={styles.maidHeader}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }}
            style={styles.maidAvatar}
          />
          <View style={styles.maidDetails}>
            <Text style={styles.maidName}>{params.maidName}</Text>
            <View style={styles.maidRating}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>4.8 (120+ reviews)</Text>
            </View>
            <Text style={styles.maidStatus}>{maidStatus}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>{distance}</Text>
            <Text style={styles.distanceLabel}>away</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.max(10, 100 - (estimatedTime * 5))}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {estimatedTime <= 5 ? 'Almost at your doorstep!' : 'Making her way to you'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Phone size={20} color={COLORS.white} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <MessageCircle size={20} color={COLORS.primary} />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Live Updates Timeline */}
      <Card style={styles.updatesCard}>
        <Text style={styles.updatesTitle}>Live Updates</Text>
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Maid is on the way to your location</Text>
              <Text style={styles.timelineTime}>2 min ago</Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: COLORS.primary }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Booking confirmed and maid assigned</Text>
              <Text style={styles.timelineTime}>5 min ago</Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: COLORS.textSecondary }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Payment processed successfully</Text>
              <Text style={styles.timelineTime}>8 min ago</Text>
            </View>
          </View>
        </View>
      </Card>
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
    padding: 4,
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
  refreshButton: {
    padding: 8,
  },
  mapContainer: {
    height: 300,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderContent: {
    alignItems: 'center',
  },
  mapPlaceholderTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 16,
  },
  mapPlaceholderSubtext: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  locationIndicators: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  locationIndicator: {
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  etaCard: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.m,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  etaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etaText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  etaLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  maidInfoCard: {
    margin: 20,
    padding: 20,
  },
  maidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  maidAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  maidDetails: {
    flex: 1,
  },
  maidName: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  maidRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  maidStatus: {
    ...FONTS.body3,
    color: COLORS.success,
    fontWeight: '600',
  },
  distanceContainer: {
    alignItems: 'flex-end',
  },
  distanceText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  distanceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.m,
    gap: 8,
  },
  callButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  messageButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.m,
    gap: 8,
  },
  messageButtonText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  updatesCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
  },
  updatesTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
