import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, formatIndianCurrency } from '@/lib/constants';
import { useBooking } from '@/context/BookingContext';
import Card from '@/components/ui/Card';
import { useFocusEffect } from '@react-navigation/native';

export default function DateTimeScreen() {
  const router = useRouter();
  const { bookingData, setBookingDateTime } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Debug logging
  useEffect(() => {
    console.log('DateTime Screen - Booking Data:', bookingData);
  }, [bookingData]);

  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-IN', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return dates;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        slots.push({ time, displayTime });
      }
    }
    return slots;
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select both date and time');
      return;
    }

    console.log('Selected date:', selectedDate);
    console.log('Selected time:', selectedTime);

    setBookingDateTime(selectedDate, selectedTime);

    // Force navigation to address screen
    router.push('/(booking)/address');
  };

  // Make sure your continue button is properly enabled
  <TouchableOpacity
    style={[
      styles.continueButton,
      (!selectedDate || !selectedTime) && styles.disabledButton
    ]}
    onPress={handleContinue}
    disabled={!selectedDate || !selectedTime}
  >
    <Text style={styles.continueButtonText}>Continue to Address</Text>
  </TouchableOpacity>


  const renderDateItem = (item: any) => (
    <TouchableOpacity
      key={item.date}
      style={[
        styles.dateItem,
        selectedDate === item.date && styles.selectedDateItem,
        item.isToday && styles.todayDateItem
      ]}
      onPress={() => {
        console.log('Date selected:', item.date);
        setSelectedDate(item.date);
      }}
    >
      <Text style={[
        styles.dayText,
        selectedDate === item.date && styles.selectedDateText,
        item.isToday && styles.todayText
      ]}>
        {item.day}
      </Text>
      <Text style={[
        styles.dayNumberText,
        selectedDate === item.date && styles.selectedDateText,
        item.isToday && styles.todayText
      ]}>
        {item.dayNumber}
      </Text>
      <Text style={[
        styles.monthText,
        selectedDate === item.date && styles.selectedDateText,
        item.isToday && styles.todayText
      ]}>
        {item.month}
      </Text>
      {item.isToday && (
        <Text style={[styles.todayLabel, selectedDate === item.date && styles.selectedDateText]}>
          Today
        </Text>
      )}
    </TouchableOpacity>
  );
  const renderTimeItem = (item: any) => (
    <TouchableOpacity
      key={item.time}
      style={[
        styles.timeItem,
        selectedTime === item.time && styles.selectedTimeItem
      ]}
      onPress={() => {
        console.log('Time selected:', item.time);
        setSelectedTime(item.time);
      }}
    >
      <Text style={[
        styles.timeText,
        selectedTime === item.time && styles.selectedTimeText
      ]}>
        {item.displayTime}
      </Text>
    </TouchableOpacity>
  );
  




  // Safety check for bookingData
  if (!bookingData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking data not found. Please go back and select a service.</Text>
        <TouchableOpacity
          style={styles.backToServicesButton}
          onPress={() => router.replace('/(booking)/services')}
        >
          <Text style={styles.backToServicesText}>Select Service</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Select Date & Time</Text>
          {bookingData.service && bookingData.maid && (
            <Text style={styles.headerSubtitle}>
              {bookingData.service.name} with {bookingData.maid.name}
            </Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Service Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>{bookingData.service?.name || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Maid:</Text>
              <Text style={styles.summaryValue}>{bookingData.maid?.name || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{bookingData.service?.duration || 0} minutes</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price:</Text>
              <Text style={styles.summaryPrice}>
                {formatIndianCurrency(bookingData.service?.price || 0)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesList}
          >
            {dates.map(renderDateItem)}
          </ScrollView>
        </View>
        

        {/* Time Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>
          <View style={styles.timeGrid}>
            {timeSlots.map(renderTimeItem)}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedDate || !selectedTime) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.continueButtonText}>Continue to Address</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...FONTS.body2,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  backToServicesButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.m,
  },
  backToServicesText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: 'bold',
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
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    marginBottom: 24,
    padding: 16,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
  },
  summaryPrice: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  datesList: {
    paddingHorizontal: 4,
  },
  dateItem: {
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 70,
  },
  selectedDateItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  todayDateItem: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  dayText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dayNumberText: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  monthText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  todayLabel: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: COLORS.white,
  },
  todayText: {
    color: COLORS.primary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
  },
  selectedTimeText: {
    color: COLORS.white,
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
