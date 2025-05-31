import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Star, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SHADOWS, formatIndianCurrency } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { getUserBookings } from '@/lib/supabase-helpers';
import Card from '@/components/ui/Card';

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user || user.id.startsWith('temp_')) {
      // For new users or temp users, show empty state
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching booking history for user:', user.id);
      
      // Fetch real booking history from Supabase
      const data = await getUserBookings(user.id);
      
      // Filter for completed and cancelled bookings only
      const historyData = data.filter(booking => 
        booking.status === 'completed' || booking.status === 'cancelled'
      );
      
      console.log('History data fetched:', historyData.length, 'bookings');
      setHistory(historyData);
      
    } catch (error) {
      console.error('Error fetching booking history:', error);
      setError('Failed to load history. Please try again.');
      // For demo purposes, show some mock data if Supabase fails
      const mockHistory = [
        {
          id: '101',
          booking_date: '2024-12-20',
          booking_time: '09:00',
          status: 'completed',
          address: '123 Bandra West, Mumbai, Maharashtra',
          total_price: 500,
          rated: true,
          rating: 4.5,
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
          id: '102',
          booking_date: '2024-12-10',
          booking_time: '14:00',
          status: 'completed',
          address: '456 Koramangala, Bangalore, Karnataka',
          total_price: 1200,
          rated: false,
          services: {
            name: 'Gehri Safai (Deep Cleaning)',
            category: 'Cleaning',
            duration: 4,
          },
          maids: {
            name: 'Asha Patel',
            avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          },
        },
      ];
      setHistory(mockHistory);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: any) => {
    router.push(`/booking/details/${booking.id}`);
  };

  const handleRateService = (booking: any) => {
    router.push(`/booking/rate/${booking.id}`);
  };

  const handleRebookService = (booking: any) => {
    // Navigate to booking flow with pre-filled service info
    router.push({
      pathname: '/(booking)/datetime',
      params: {
        serviceId: booking.service_id || booking.services?.id,
        maidId: booking.maid_id || booking.maids?.id,
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
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

  const renderHistoryItem = ({ item }: { item: any }) => (
    <Card style={styles.historyCard}>
      <TouchableOpacity
        onPress={() => handleBookingPress(item)}
        style={styles.cardHeader}
        activeOpacity={0.7}
      >
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>
            {item.services?.name || item.service_name || 'Service'}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            {formatIndianCurrency(item.total_price)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.dateInfo}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.booking_date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatTime(item.booking_time)}</Text>
        </View>
      </View>

      <View style={styles.maidContainer}>
        <Image
          source={{ 
            uri: item.maids?.avatar_url || item.maid_avatar || 
            'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' 
          }}
          style={styles.maidImage}
        />
        <Text style={styles.maidName}>
          {item.maids?.name || item.maid_name || 'Service Provider'}
        </Text>
      </View>

      <View style={styles.divider} />

      {item.status === 'completed' && (
        <View style={styles.actionsContainer}>
          {item.rated ? (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Your Rating:</Text>
              <View style={styles.starsContainer}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingValue}>{item.rating?.toFixed(1) || '5.0'}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRateService(item)}
            >
              <Text style={styles.actionButtonText}>Rate Service</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.rebookButton]}
            onPress={() => handleRebookService(item)}
          >
            <Text style={[styles.actionButtonText, styles.rebookButtonText]}>Book Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg' }}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptyText}>
        {user?.id?.startsWith('temp_') 
          ? 'Complete your profile and start booking services to see your history here.'
          : 'You haven\'t completed any bookings yet. Your booking history will appear here.'
        }
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
        <Text style={styles.loadingText}>Loading your booking history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking History</Text>
        {user && !user.id.startsWith('temp_') && (
          <Text style={styles.headerSubtitle}>
            {history.length} completed bookings
          </Text>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
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
  headerSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  historyCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    width: '100%',
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
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
    marginLeft: 8,
  },
  priceText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dateInfo: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  maidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.s,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  rebookButton: {
    backgroundColor: COLORS.success,
  },
  rebookButtonText: {
    color: COLORS.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ratingLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 4,
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
    lineHeight: 22,
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
