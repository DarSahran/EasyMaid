import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star, Bell, Filter, Navigation, Clock, Users, Shield } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import { useTheme } from '@/context/ThemeContext';
import { getTopRatedMaids, getServices, getMaidsByCity, Maid, Service } from '@/lib/supabase-helpers';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

const { width } = Dimensions.get('window');

// Updated comprehensive Indian service categories
const SERVICE_CATEGORIES = [
  { 
    id: 'housekeeping', 
    name: 'Housekeeping', 
    icon: '🏠', 
    color: '#4CAF50',
    description: 'Complete house cleaning services',
    services: ['Cleaning', 'Mopping', 'Dusting', 'Sweeping', 'Window Cleaning'],
    price: 'Starting ₹400'
  },
  { 
    id: 'laundry', 
    name: 'Laundry', 
    icon: '👕', 
    color: '#2196F3',
    description: 'Clothes washing and care',
    services: ['Washing', 'Ironing', 'Folding', 'Wardrobe Management'],
    price: 'Starting ₹250'
  },
  { 
    id: 'cooking', 
    name: 'Cooking', 
    icon: '👨‍🍳', 
    color: '#FF9800',
    description: 'Meal preparation services',
    services: ['Breakfast', 'Lunch', 'Dinner', 'Tiffin Packing'],
    price: 'Starting ₹300'
  },
  { 
    id: 'childcare', 
    name: 'Childcare', 
    icon: '👶', 
    color: '#E91E63',
    description: 'Professional childcare',
    services: ['Babysitting', 'Feeding', 'School Pickup', 'Diaper Changing'],
    price: 'Starting ₹300'
  },
  { 
    id: 'elderly-care', 
    name: 'Elderly Care', 
    icon: '👴', 
    color: '#9C27B0',
    description: 'Compassionate elderly care',
    services: ['Companionship', 'Medication', 'Walking Assistance', 'Light Massage'],
    price: 'Starting ₹400'
  },
  { 
    id: 'pet-care', 
    name: 'Pet Care', 
    icon: '🐕', 
    color: '#795548',
    description: 'Pet care services',
    services: ['Feeding', 'Cleaning', 'Dog Walking'],
    price: 'Starting ₹150'
  },
  { 
    id: 'utensils', 
    name: 'Utensils', 
    icon: '🍽️', 
    color: '#607D8B',
    description: 'Kitchen and dishwashing',
    services: ['Dishwashing', 'Kitchen Cleanup'],
    price: 'Starting ₹150'
  },
  { 
    id: 'grocery-help', 
    name: 'Grocery Help', 
    icon: '🛒', 
    color: '#FF5722',
    description: 'Shopping assistance',
    services: ['Market Runs', 'Online Orders'],
    price: 'Starting ₹200'
  },
];

// Indian currency formatter
const formatIndianCurrency = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { setSelectedService } = useBooking();
  const { theme, colors, isDark } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [topMaids, setTopMaids] = useState<Maid[]>([]);
  const [nearbyMaids, setNearbyMaids] = useState<Maid[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState('Getting your location...');
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    loadData();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to find nearby maids and get accurate service costs.',
          [
            { text: 'Cancel', onPress: () => setAddress('Location not available') },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.name || addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.replace(/^,\s*/, '');
        const city = addr.city || '';
        
        setAddress(formattedAddress || 'Location found');
        setSelectedCity(city);
        
        // Fetch maids for this city
        if (city) {
          await fetchMaidsByCity(city);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setAddress('Unable to get location');
      Alert.alert('Location Error', 'Unable to get your current location. Please check your location settings.');
    } finally {
      setLocationLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [maidsData, servicesData] = await Promise.all([
        getTopRatedMaids(5),
        getServices()
      ]);
      
      setTopMaids(maidsData);
      setNearbyMaids(maidsData);
      setPopularServices(servicesData.slice(0, 3));
    } catch (error) {
      console.error('Error loading data:', error);
      setTopMaids([]);
      setNearbyMaids([]);
      setPopularServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaidsByCity = async (city: string) => {
    try {
      console.log('Fetching maids for city:', city);
      
      // Try to get maids by city
      const cityMaids = await getMaidsByCity(city);
      
      if (cityMaids.length > 0) {
        setNearbyMaids(cityMaids);
      } else {
        // If no exact city match, show all maids as fallback
        setNearbyMaids(topMaids);
      }
      
      console.log(`Found ${cityMaids.length} maids in ${city}`);
    } catch (error) {
      console.error('Error fetching maids by city:', error);
      setNearbyMaids(topMaids); // Fallback to all maids
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setAddress(`${city}, India`);
    fetchMaidsByCity(city);
  };

  const showCitySelector = () => {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
    
    Alert.alert(
      'Select Your City',
      'Choose your city to find nearby maids',
      cities.map(city => ({
        text: city,
        onPress: () => handleCitySelect(city)
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const handleServicePress = (category: any) => {
    router.push({
      pathname: '/(booking)/services',
      params: { category: category.name }
    });
  };

  const handleServiceBooking = (service: Service) => {
    setSelectedService(service);
    router.push('/(booking)/maid-selection');
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: colors.card }]}
      onPress={() => handleServicePress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
        <Text style={[styles.categoryServices, { color: colors.textTertiary }]}>
          {item.services.slice(0, 2).join(', ')}
          {item.services.length > 2 ? '...' : ''}
        </Text>
        <Text style={[styles.categoryPrice, { color: item.color }]}>{item.price}</Text>
      </View>
      <View style={[styles.categoryArrow, { backgroundColor: item.color + '10' }]}>
        <Text style={[styles.arrowText, { color: item.color }]}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMaidItem = ({ item }: { item: Maid }) => (
    <Card style={[styles.maidCard, { backgroundColor: colors.card }]}>
      <TouchableOpacity onPress={() => router.push(`/maid/${item.id}`)}>
        <View style={styles.maidHeader}>
          <Image source={{ uri: item.image_url }} style={styles.maidImage} />
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Shield size={12} color="white" />
            </View>
          )}
        </View>
        <View style={styles.maidInfo}>
          <Text style={[styles.maidName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {item.rating} ({item.reviews_count})
            </Text>
          </View>
          <Text style={[styles.maidSkills, { color: colors.textTertiary }]}>
            {item.skills.join(' • ')}
          </Text>
          <View style={styles.maidFooter}>
            <Text style={[styles.maidRate, { color: colors.primary }]}>
              {formatIndianCurrency(item.hourly_rate)}/hr
            </Text>
            <TouchableOpacity 
              style={[styles.bookMaidButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push({
                pathname: '/(booking)/maid-selection',
                params: { selectedMaidId: item.id }
              })}
            >
              <Text style={styles.bookMaidText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderServiceItem = ({ item }: { item: Service }) => (
    <Card style={[styles.serviceCard, { backgroundColor: colors.card }]}>
      <Image source={{ uri: item.image_url }} style={styles.serviceImage} />
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={[styles.serviceTitle, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.serviceBadge}>
            <Clock size={12} color={colors.primary} />
            <Text style={[styles.serviceDuration, { color: colors.primary }]}>
              {item.duration}min
            </Text>
          </View>
        </View>
        <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
        <View style={styles.serviceFooter}>
          <Text style={[styles.servicePrice, { color: colors.primary }]}>
            {formatIndianCurrency(item.price)}
          </Text>
          <TouchableOpacity
            style={[styles.bookServiceButton, { backgroundColor: colors.primary }]}
            onPress={() => handleServiceBooking(item)}
          >
            <Text style={styles.bookServiceText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.primary}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Real Location */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerTop}>
            <View style={styles.locationContainer}>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={() => {
                  Alert.alert(
                    'Select Location',
                    'Choose your city to find nearby maids',
                    [
                      { text: 'Use Current Location', onPress: getCurrentLocation },
                      { text: 'Select City', onPress: showCitySelector },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={colors.card} />
                ) : (
                  <Navigation color={colors.card} size={18} />
                )}
                <View style={styles.locationTextContainer}>
                  <Text style={[styles.locationLabel, { color: colors.card }]}>Your Location</Text>
                  <Text style={[styles.locationText, { color: colors.card }]} numberOfLines={1}>
                    {address}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell color={colors.card} size={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => router.push('/(tabs)/profile')}
              >
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
                    <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                      {user?.name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Welcome Section */}
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeText, { color: colors.card }]}>
              Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
            </Text>
            <Text style={[styles.tagline, { color: colors.card }]}>
              Book trusted home services at your fingertips
            </Text>
          </View>
        </View>

        {/* Search Section */}
        <View style={[styles.searchSection, { backgroundColor: colors.primary }]}>
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search for services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Search color={colors.textSecondary} size={20} />}
              rightIcon={<Filter color={colors.textSecondary} size={20} />}
              containerStyle={styles.searchInput}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Users size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>500+</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Verified Maids</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Star size={24} color="#FFD700" />
            <Text style={[styles.statNumber, { color: colors.text }]}>4.8</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average Rating</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Shield size={24} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text }]}>100%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Background Verified</Text>
          </View>
        </View>

        {/* Professional Service Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Services</Text>
            <TouchableOpacity onPress={() => router.push('/(booking)/services')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={SERVICE_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Top Rated Maids with Location Filter */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedCity ? `Top Maids in ${selectedCity}` : 'Top Rated Maids Near You'}
            </Text>
            <TouchableOpacity onPress={showCitySelector}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Change City</Text>
            </TouchableOpacity>
          </View>
          {nearbyMaids.length > 0 ? (
            <FlatList
              data={nearbyMaids}
              renderItem={renderMaidItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.maidsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {selectedCity 
                  ? `No maids available in ${selectedCity}. Showing all available maids.`
                  : 'Select your location to find nearby maids'
                }
              </Text>
              <TouchableOpacity
                style={styles.selectLocationButton}
                onPress={showCitySelector}
              >
                <Text style={styles.selectLocationText}>Select Location</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Featured Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Services</Text>
          </View>
          <View style={styles.servicesList}>
            {popularServices.map(service => (
              <View key={service.id} style={styles.serviceItemContainer}>
                {renderServiceItem({ item: service })}
              </View>
            ))}
          </View>
        </View>

        {/* Promotion Banner */}
        <View style={styles.section}>
          <Card style={[styles.promotionCard, { backgroundColor: colors.primary }]}>
            <View style={styles.promotionContent}>
              <View style={styles.promotionText}>
                <Text style={[styles.promotionTitle, { color: colors.card }]}>
                  🎉 First Time User?
                </Text>
                <Text style={[styles.promotionSubtitle, { color: colors.card }]}>
                  Get 20% off on your first booking
                </Text>
                <Text style={[styles.promoCode, { color: colors.card }]}>
                  Use code: MAIDEASY20
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.promotionButton, { backgroundColor: colors.card }]}
                onPress={() => router.push('/(booking)/services')}
              >
                <Text style={[styles.promotionButtonText, { color: colors.primary }]}>
                  Book Now
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: 'center', marginBottom: 20 }]}>
            How It Works
          </Text>
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Choose Service</Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Select from our wide range of home services
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Pick Your Maid</Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Choose from verified and rated professionals
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Schedule & Pay</Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Book your preferred time and pay securely
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  locationContainer: {
    flex: 1,
    marginRight: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.9,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  categoryServices: {
    fontSize: 11,
    marginBottom: 4,
  },
  categoryPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  maidsList: {
    paddingHorizontal: 16,
  },
  maidCard: {
    width: width * 0.7,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  maidHeader: {
    position: 'relative',
    marginBottom: 12,
  },
  maidImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22c55e',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maidInfo: {
    flex: 1,
  },
  maidName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  maidSkills: {
    fontSize: 12,
    marginBottom: 8,
  },
  maidFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maidRate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookMaidButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bookMaidText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  servicesList: {
    paddingHorizontal: 20,
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 140,
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fa442a20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceDuration: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookServiceButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookServiceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  serviceItemContainer: {
    marginBottom: 12,
  },
  promotionCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  promotionText: {
    flex: 1,
    marginRight: 16,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promotionSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  promoCode: {
    fontSize: 12,
    opacity: 0.9,
  },
  promotionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  promotionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  selectLocationButton: {
    backgroundColor: '#fa442a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectLocationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
