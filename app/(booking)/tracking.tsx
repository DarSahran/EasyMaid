import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Alert, ScrollView, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, MessageCircle, Navigation, Clock, MapPin, Star, Shield, CheckCircle } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS } from '@/lib/constants';
import { soundManager } from '@/lib/soundManager';
import Card from '@/components/ui/Card';

// Realistic tracking stages with dynamic updates
const TRACKING_STAGES = [
  { id: 1, title: 'Booking Confirmed', description: 'Your booking has been confirmed', completed: true },
  { id: 2, title: 'Maid Assigned', description: 'Priya has been assigned to your booking', completed: true },
  { id: 3, title: 'Getting Ready', description: 'Maid is preparing to leave', completed: true },
  { id: 4, title: 'On the Way', description: 'Maid is traveling to your location', completed: false, active: true },
  { id: 5, title: 'Nearby', description: 'Maid is very close to your location', completed: false },
  { id: 6, title: 'Arrived', description: 'Maid has reached your location', completed: false },
];

// Realistic Mumbai route with actual locations
const REALISTIC_ROUTE = [
  { location: 'Started from Bandra Station', time: '12 min ago', distance: '3.2 km', speed: '0 km/h', icon: '🚌', status: 'boarding' },
  { location: 'Walking on SV Road', time: '10 min ago', distance: '2.8 km', speed: '4 km/h', icon: '🚶‍♀️', status: 'walking' },
  { location: 'Waiting at Linking Road Signal', time: '8 min ago', distance: '2.3 km', speed: '0 km/h', icon: '🚦', status: 'waiting' },
  { location: 'Crossing Linking Road Junction', time: '6 min ago', distance: '1.9 km', speed: '5 km/h', icon: '🚶‍♀️', status: 'walking' },
  { location: 'Near Shoppers Stop, Bandra', time: '4 min ago', distance: '1.4 km', speed: '3 km/h', icon: '🏪', status: 'walking' },
  { location: 'Entering Hill Road', time: '2 min ago', distance: '0.8 km', speed: '4 km/h', icon: '🚶‍♀️', status: 'walking' },
  { location: 'Near your building complex', time: '1 min ago', distance: '0.3 km', speed: '2 km/h', icon: '🏢', status: 'approaching' },
  { location: 'At your building entrance', time: 'Just now', distance: '0.1 km', speed: '1 km/h', icon: '🚪', status: 'arriving' },
  { location: 'At your doorstep', time: 'Now', distance: 'Arrived', speed: '0 km/h', icon: '🎯', status: 'arrived' },
];

export default function TrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Realistic state management
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [currentStage, setCurrentStage] = useState(4);
  const [maidStatus, setMaidStatus] = useState('On the way to your location');
  const [distance, setDistance] = useState('3.2 km');
  const [currentLocation, setCurrentLocation] = useState('Bandra Station');
  const [hasArrived, setHasArrived] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState('4 km/h');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [lastUpdate, setLastUpdate] = useState('Just now');
  const [isMoving, setIsMoving] = useState(true);
  
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Animate the location pulse
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();

    // Realistic irregular updates
    const createRealisticInterval = () => {
      // Random interval between 2-6 seconds to simulate real GPS updates
      const randomInterval = Math.random() * 4000 + 2000;
      
      setTimeout(() => {
        updateMaidLocation();
        createRealisticInterval(); // Create next random interval
      }, randomInterval);
    };

    createRealisticInterval();

    return () => {
      // Cleanup handled by the recursive timeout
    };
  }, [currentRouteIndex, hasArrived]);

  const updateMaidLocation = () => {
    if (hasArrived || currentRouteIndex >= REALISTIC_ROUTE.length - 1) return;

    // Simulate realistic movement patterns
    const shouldMove = Math.random() > 0.2; // 80% chance to move (simulates stops, signals, etc.)
    
    if (!shouldMove && Math.random() > 0.5) {
      // Sometimes the maid stops (waiting at signals, taking breaks, etc.)
      setIsMoving(false);
      setCurrentSpeed('0 km/h');
      setLastUpdate('Just now');
      return;
    }

    setIsMoving(true);
    
    // Move to next location with some randomness
    const nextIndex = Math.min(currentRouteIndex + 1, REALISTIC_ROUTE.length - 1);
    const currentRoute = REALISTIC_ROUTE[nextIndex];
    
    setCurrentRouteIndex(nextIndex);
    setCurrentLocation(currentRoute.location);
    setDistance(currentRoute.distance);
    setCurrentSpeed(currentRoute.speed);
    setLastUpdate('Just now');
    
    // Update battery level (decreases slowly)
    setBatteryLevel(prev => Math.max(20, prev - Math.random() * 2));
    
    // Calculate realistic ETA based on distance
    const distanceNum = parseFloat(currentRoute.distance);
    if (!isNaN(distanceNum)) {
      const speedNum = parseFloat(currentRoute.speed) || 3;
      const timeInMinutes = Math.max(1, Math.round((distanceNum / speedNum) * 60));
      setEstimatedTime(timeInMinutes);
    }

    // Update status and stage based on progress
    updateStatusAndStage(nextIndex, currentRoute);
  };

  const updateStatusAndStage = (routeIndex: number, route: any) => {
    const progress = (routeIndex / (REALISTIC_ROUTE.length - 1)) * 100;
    
    if (progress >= 100) {
      setMaidStatus('🎉 Maid has arrived at your location!');
      setCurrentStage(6);
      setHasArrived(true);
      setEstimatedTime(0);
      soundManager.playBookingConfirmed();
    } else if (progress >= 80) {
      setMaidStatus('Almost at your doorstep - can see your building!');
      setCurrentStage(5);
    } else if (progress >= 60) {
      setMaidStatus('Very close to your location');
      setCurrentStage(5);
    } else if (progress >= 40) {
      setMaidStatus('Halfway there - making good progress');
      setCurrentStage(4);
    } else {
      setMaidStatus('On the way to your location');
      setCurrentStage(4);
    }
  };

  const getRecentUpdates = () => {
    const endIndex = Math.min(currentRouteIndex + 1, REALISTIC_ROUTE.length);
    const startIndex = Math.max(0, endIndex - 4);
    return REALISTIC_ROUTE.slice(startIndex, endIndex).reverse();
  };

  const handleCall = async () => {
    await soundManager.playSwoosh();
    Alert.alert(
      'Call Maid',
      `Would you like to call ${params.maidName}?\n\nPhone: +91 98765 43210\nLast seen: ${lastUpdate}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => console.log('Calling maid...') }
      ]
    );
  };

  const handleMessage = async () => {
    await soundManager.playSwoosh();
    Alert.alert(
      'Message Maid',
      `Send a quick message to ${params.maidName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send "Where are you?"', onPress: () => console.log('Sending location request...') },
        { text: 'Send "Take your time"', onPress: () => console.log('Sending patience message...') },
        { text: 'Custom Message', onPress: () => console.log('Opening chat...') }
      ]
    );
  };

  const handleEmergencyContact = async () => {
    await soundManager.playSwoosh();
    Alert.alert(
      'Emergency Contact',
      'Contact our 24/7 support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Support: 1800-MAID-HELP', onPress: () => console.log('Calling support...') }
      ]
    );
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
          <Text style={styles.headerSubtitle}>{params.maidName || 'Priya Sharma'}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => console.log('Refreshing...')}>
          <Navigation size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Live Status Card */}
        <Card style={[styles.statusCard, hasArrived && styles.arrivedStatusCard]}>
          <View style={styles.statusHeader}>
            <View style={styles.liveIndicator}>
              <Animated.View style={[
                styles.liveDot, 
                { 
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: isMoving ? COLORS.success : COLORS.warning
                }
              ]} />
              <Text style={[styles.liveText, { color: isMoving ? COLORS.success : COLORS.warning }]}>
                {isMoving ? 'MOVING' : 'STOPPED'}
              </Text>
            </View>
            <View style={[styles.etaContainer, hasArrived && styles.arrivedEtaContainer]}>
              <Clock size={16} color={hasArrived ? COLORS.success : COLORS.primary} />
              <Text style={[styles.etaText, hasArrived && styles.arrivedEtaText]}>
                {hasArrived ? 'Arrived!' : `${estimatedTime} min`}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.statusTitle, hasArrived && styles.arrivedStatusTitle]}>
            {maidStatus}
          </Text>
          <Text style={styles.currentLocation}>📍 {currentLocation}</Text>
          <View style={styles.statusDetails}>
            <Text style={styles.distanceText}>
              {hasArrived ? '🎉 Ready to start service!' : `${distance} away`}
            </Text>
            <Text style={styles.speedText}>Speed: {currentSpeed}</Text>
            <Text style={styles.batteryText}>📱 Battery: {Math.round(batteryLevel)}%</Text>
          </View>
        </Card>

        {/* Maid Info Card */}
        <Card style={styles.maidCard}>
          <View style={styles.maidHeader}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }}
              style={styles.maidImage}
            />
            <View style={styles.maidDetails}>
              <View style={styles.maidNameRow}>
                <Text style={styles.maidName}>{params.maidName || 'Priya Sharma'}</Text>
                <Shield size={16} color={COLORS.success} />
              </View>
              <View style={styles.maidRating}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>4.8 (120+ reviews)</Text>
              </View>
              <Text style={styles.maidService}>{params.serviceName || 'House Cleaning'}</Text>
              <Text style={styles.maidExperience}>5+ years experience • Last update: {lastUpdate}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Phone size={18} color={COLORS.white} />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <MessageCircle size={18} color={COLORS.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Tracking Progress */}
        <Card style={styles.progressCard}>
          <Text style={styles.progressTitle}>Journey Progress</Text>
          {TRACKING_STAGES.map((stage, index) => {
            const isCompleted = stage.id <= currentStage;
            const isActive = stage.id === currentStage;
            
            return (
              <View key={stage.id} style={styles.stageItem}>
                <View style={styles.stageIndicator}>
                  <View style={[
                    styles.stageDot,
                    isCompleted && styles.stageCompleted,
                    isActive && styles.stageActive,
                  ]}>
                    {isCompleted && stage.id < currentStage ? (
                      <CheckCircle size={12} color={COLORS.white} />
                    ) : isActive ? (
                      <Animated.View style={[styles.activePulse, { transform: [{ scale: pulseAnim }] }]} />
                    ) : null}
                  </View>
                  {index < TRACKING_STAGES.length - 1 && (
                    <View style={[
                      styles.stageLine,
                      isCompleted && styles.stageLineCompleted
                    ]} />
                  )}
                </View>
                <View style={styles.stageContent}>
                  <Text style={[
                    styles.stageTitle,
                    isActive && styles.stageTitleActive,
                    isCompleted && styles.stageTitleCompleted
                  ]}>
                    {stage.title}
                  </Text>
                  <Text style={[
                    styles.stageDescription,
                    isActive && styles.stageDescriptionActive
                  ]}>
                    {stage.description}
                  </Text>
                </View>
                <Text style={styles.stageTime}>
                  {isCompleted ? '✓' : isActive ? 'Now' : ''}
                </Text>
              </View>
            );
          })}
        </Card>

        {/* Live Location Updates */}
        <Card style={styles.updatesCard}>
          <Text style={styles.updatesTitle}>Live Location Updates</Text>
          {getRecentUpdates().map((update, index) => (
            <View key={index} style={styles.updateItem}>
              <Text style={styles.updateIcon}>{update.icon}</Text>
              <View style={styles.updateContent}>
                <Text style={styles.updateLocation}>{update.location}</Text>
                <View style={styles.updateMeta}>
                  <Text style={styles.updateTime}>{update.time}</Text>
                  <Text style={styles.updateDistance}>{update.distance}</Text>
                  <Text style={styles.updateSpeed}>{update.speed}</Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Service Details */}
        <Card style={styles.serviceCard}>
          <Text style={styles.serviceTitle}>Today's Service</Text>
          <View style={styles.serviceDetails}>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>Service:</Text>
              <Text style={styles.serviceValue}>{params.serviceName || 'House Cleaning'}</Text>
            </View>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>Duration:</Text>
              <Text style={styles.serviceValue}>2 hours</Text>
            </View>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>Estimated start:</Text>
              <Text style={styles.serviceValue}>
                {hasArrived ? 'Starting soon' : `${new Date(Date.now() + estimatedTime * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
              </Text>
            </View>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>Route progress:</Text>
              <Text style={styles.serviceValue}>
                {Math.round((currentRouteIndex / (REALISTIC_ROUTE.length - 1)) * 100)}% complete
              </Text>
            </View>
          </View>
        </Card>

        {/* Emergency Contact */}
        <Card style={styles.emergencyCard}>
          <View style={styles.emergencyContent}>
            <View style={styles.emergencyHeader}>
              <Shield size={20} color={COLORS.error} />
              <Text style={styles.emergencyTitle}>Need Help?</Text>
            </View>
            <Text style={styles.emergencyText}>
              Our 24/7 support team is here to help with any concerns
            </Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyContact}>
              <Phone size={16} color={COLORS.error} />
              <Text style={styles.emergencyButtonText}>Emergency: 1800-MAID-HELP</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: COLORS.primary + '20',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  arrivedStatusCard: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success + '30',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    ...FONTS.caption,
    fontWeight: 'bold',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  arrivedEtaContainer: {
    backgroundColor: COLORS.success + '20',
  },
  etaText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  arrivedEtaText: {
    color: COLORS.success,
  },
  statusTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  arrivedStatusTitle: {
    color: COLORS.success,
  },
  currentLocation: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 8,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  distanceText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  speedText: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  batteryText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  maidCard: {
    marginBottom: 20,
    padding: 20,
  },
  maidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  maidImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.success,
  },
  maidDetails: {
    flex: 1,
  },
  maidNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  maidName: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginRight: 8,
  },
  maidRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  maidService: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  maidExperience: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
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
    paddingVertical: 12,
    borderRadius: RADIUS.m,
    gap: 6,
  },
  callButtonText: {
    ...FONTS.body3,
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
    paddingVertical: 12,
    borderRadius: RADIUS.m,
    gap: 6,
  },
  messageButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressCard: {
    marginBottom: 20,
    padding: 20,
  },
  progressTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stageIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  stageDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stageActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  activePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  stageLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  stageLineCompleted: {
    backgroundColor: COLORS.success,
  },
  stageContent: {
    flex: 1,
  },
  stageTitle: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  stageTitleActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  stageTitleCompleted: {
    color: COLORS.success,
  },
  stageDescription: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  stageDescriptionActive: {
    color: COLORS.primary,
  },
  stageTime: {
    ...FONTS.caption,
    color: COLORS.success,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'right',
  },
  updatesCard: {
    marginBottom: 20,
    padding: 20,
  },
  updatesTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  updateIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  updateContent: {
    flex: 1,
  },
  updateLocation: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  updateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  updateTime: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  updateDistance: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  updateSpeed: {
    ...FONTS.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  serviceCard: {
    marginBottom: 20,
    padding: 20,
  },
  serviceTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  serviceDetails: {
    gap: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  serviceValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
  },
  emergencyCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  emergencyContent: {
    alignItems: 'center',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  emergencyTitle: {
    ...FONTS.body2,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  emergencyText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.s,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.white,
  },
  emergencyButtonText: {
    ...FONTS.body3,
    color: COLORS.error,
    fontWeight: '600',
  },
});
