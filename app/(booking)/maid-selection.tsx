import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Star, Shield, Clock, ArrowLeft } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, formatIndianCurrency } from '@/lib/constants';
import { getTopRatedMaids, Maid } from '@/lib/supabase-helpers';
import { useBooking } from '@/context/BookingContext';
import Card from '@/components/ui/Card';

export default function MaidSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedService, setSelectedMaid } = useBooking();
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaidId, setSelectedMaidId] = useState<string | null>(
    params.selectedMaidId as string || null
  );

  useEffect(() => {
    fetchMaids();
  }, []);

  const fetchMaids = async () => {
    try {
      const maidsData = await getTopRatedMaids(10);
      setMaids(maidsData);
    } catch (error) {
      console.error('Error fetching maids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaidSelect = (maid: Maid) => {
    setSelectedMaidId(maid.id);
    setSelectedMaid(maid);
  };

  const handleContinue = () => {
    if (!selectedMaidId) {
      alert('Please select a maid to continue');
      return;
    }
    router.push('/(booking)/datetime');
  };

  const renderMaidItem = ({ item }: { item: Maid }) => (
    <Card style={[
      styles.maidCard,
      selectedMaidId === item.id && styles.selectedMaidCard
    ]}>
      <TouchableOpacity onPress={() => handleMaidSelect(item)}>
        <View style={styles.maidHeader}>
          <Image source={{ uri: item.image_url }} style={styles.maidImage} />
          <View style={styles.maidInfo}>
            <View style={styles.maidNameRow}>
              <Text style={styles.maidName}>{item.name}</Text>
              {item.verified && (
                <View style={styles.verifiedBadge}>
                  <Shield size={12} color="white" />
                </View>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{item.rating} ({item.reviews_count} reviews)</Text>
            </View>
            <Text style={styles.maidSkills}>{item.skills.join(' • ')}</Text>
            <Text style={styles.maidLocation}>📍 {item.city}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formatIndianCurrency(item.hourly_rate)}</Text>
            <Text style={styles.priceLabel}>per hour</Text>
          </View>
        </View>
        <View style={styles.maidStats}>
          <View style={styles.statItem}>
            <Clock size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>Available Now</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Maid</Text>
      </View>

      <FlatList
        data={maids}
        renderItem={renderMaidItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedMaidId && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedMaidId}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  listContainer: {
    padding: 20,
  },
  maidCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMaidCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  maidHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  maidImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  maidInfo: {
    flex: 1,
  },
  maidNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  maidName: {
    ...FONTS.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: COLORS.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  maidSkills: {
    ...FONTS.body3,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  maidLocation: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  priceLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  maidStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.m,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  continueButtonText: {
    ...FONTS.body1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
