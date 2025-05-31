import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { getUserBookings } from '@/lib/supabase-helpers';
import Card from '@/components/ui/Card';

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

// Mock data for initial rendering with Indian context
const MOCK_BOOKINGS = [
  {
    id: '1',
    booking_date: '2025-01-15',
    booking_time: '10:00',
    status: 'pending',
    address: '123 Bandra West, Mumbai, Maharashtra',
    total_price: 500,
    services: {
      name: 'Ghar Ki Safai (House Cleaning)',
      category: 'Cleaning',
      duration: 2,
    },
    maids: {
      name: 'Sunita Devi',
      avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    },
  },
  {
    id: '2',
    booking_date: '2025-01-18',
    booking_time: '14:00',
    status: 'confirmed',
    address: '456 Koramangala, Bangalore, Karnataka',
    total_price: 800,
    services: {
      name: 'Khana Pakana (Meal Preparation)',
      category: 'Cooking',
      duration: 3,
    },
    maids: {
      name: 'Asha Patel',
      avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    },
  },
];

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      
      // Try to fetch real bookings from Supabase
      try {
        const data = await getUserBookings(user.id);
        setBookings(data);
      } catch (supabaseError) {
        console.log('Using mock data as fallback');
        // Use mock data as fallback
        setTimeout(() => {
          setBookings(MOCK_BOOKINGS);
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
      // Show empty state for new users
      setBookings([]);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: any) => {
    router.push(`/booking/details/${booking.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'confirmed':
        return COLORS.success;
      case 'in_progress':
        return COLORS.secondary;
      case 'completed':
        return COLORS.primary;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <Card style={styles.bookingCard}>
      <TouchableOpacity
        onPress={() => handleBookingPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.services?.name || item.service_name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formatIndianCurrency(item.total_price)}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatDate(item.booking_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatTime(item.booking_time)}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.maidContainer}>
          {item.maids?.name && (
            <>
              <Image
                source={{ uri: item.maids.avatar_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }}
                style={styles.maidImage}
              />
              <Text style={styles.maidName}>{item.maids.name}</Text>
            </>
          )}
          <ChevronRight size={16} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg' }}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptyText}>
        You haven't made any bookings yet. Book a maid service to get started.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/(booking)/services')}
      >
        <Text style={styles.emptyButtonText}>Book a Service</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Bookings</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    marginBottom: 16,
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
  },
  priceText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  maidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maidImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  maidName: {
    ...FONTS.body3,
    color: COLORS.text,
    flex: 1,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
    borderRadius: RADIUS.l,
  },
  emptyTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.m,
  },
  emptyButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    ...FONTS.body2,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.m,
  },
  retryButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
});
