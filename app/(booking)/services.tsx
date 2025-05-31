import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Star, Filter } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, formatIndianCurrency, SERVICE_CATEGORIES } from '@/lib/constants';
import { getServices, Service } from '@/lib/supabase-helpers';
import { useBooking } from '@/context/BookingContext';
import Card from '@/components/ui/Card';

export default function ServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setSelectedService } = useBooking();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category as string || 'All'
  );

  const categories = ['All', ...SERVICE_CATEGORIES.map(cat => cat.name)];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const servicesData = await getServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory && selectedCategory !== 'All'
    ? services.filter(service => service.category === selectedCategory)
    : services;

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    router.push('/(booking)/maid-selection');
  };

  const renderCategoryItem = ({ item }: { item: string }) => {
    const categoryData = SERVICE_CATEGORIES.find(cat => cat.name === item);
    const isSelected = selectedCategory === item;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          isSelected && styles.selectedCategoryChip,
          categoryData && { borderColor: categoryData.color + '50' }
        ]}
        onPress={() => setSelectedCategory(item)}
      >
        {categoryData && (
          <Text style={styles.categoryIcon}>{categoryData.icon}</Text>
        )}
        <Text style={[
          styles.categoryChipText,
          isSelected && styles.selectedCategoryChipText
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderServiceItem = ({ item }: { item: Service }) => {
    const categoryData = SERVICE_CATEGORIES.find(cat => cat.name === item.category);
    
    return (
      <Card style={styles.serviceCard}>
        <TouchableOpacity onPress={() => handleServiceSelect(item)}>
          <Image source={{ uri: item.image_url }} style={styles.serviceImage} />
          <View style={styles.serviceContent}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <View style={[
                styles.categoryBadge, 
                { backgroundColor: categoryData?.color + '20' || COLORS.primary + '20' }
              ]}>
                <Text style={[
                  styles.categoryBadgeText,
                  { color: categoryData?.color || COLORS.primary }
                ]}>
                  {item.category}
                </Text>
              </View>
            </View>
            <Text style={styles.serviceDescription}>{item.description}</Text>
            <View style={styles.serviceFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.servicePrice}>{formatIndianCurrency(item.price)}</Text>
                <View style={styles.durationContainer}>
                  <Clock size={12} color={COLORS.textSecondary} />
                  <Text style={styles.durationText}>{item.duration}min</Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>4.8 (120+)</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Select Service</Text>
          <Text style={styles.headerSubtitle}>{filteredServices.length} services available</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
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
  filterButton: {
    padding: 8,
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  selectedCategoryChipText: {
    color: COLORS.white,
  },
  servicesList: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: 120,
  },
  serviceContent: {
    padding: 12,
  },
  serviceHeader: {
    marginBottom: 8,
  },
  serviceName: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    ...FONTS.caption,
    fontWeight: '600',
  },
  serviceDescription: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  serviceFooter: {
    gap: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});
