import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  RefreshControl,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  LogOut,
  Edit3,
  Heart,
  CreditCard,
  HelpCircle,
  Shield,
  RefreshCw,
  Bell,
  Moon,
  Star,
  History,
  Gift,
  Share2,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SHADOWS, formatIndianCurrency } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { soundManager } from '@/lib/soundManager';
import Card from '@/components/ui/Card';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, refreshUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 12,
    totalSpent: 8500,
    averageRating: 4.8,
    completedServices: 10,
    favoriteServices: 3,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await soundManager.playSwoosh();
    try {
      await refreshUser();
    } catch (error) {
      console.error('Refresh error:', error);
    }
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to log in again to access your account.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: async () => {
            await soundManager.playSwoosh();
          }
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await soundManager.playSwoosh();
              
              console.log('🔄 Starting sign out process...');
              
              // Clear user session
              await signOut();
              
              console.log('✅ Sign out successful, navigating to login');
              
              // Navigate to login screen
              router.replace('/(auth)/login');
              
              // Show success message after navigation
              setTimeout(() => {
                Alert.alert('Signed Out', 'You have been successfully signed out.');
              }, 500);
              
            } catch (error) {
              console.error('❌ Sign out error:', error);
              await soundManager.playError();
              
              // Even if there's an error, force logout locally
              Alert.alert(
                'Sign Out Error',
                'There was an issue signing out, but you have been logged out locally.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Force navigation to login
                      router.replace('/(auth)/login');
                    }
                  }
                ]
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = async () => {
    await soundManager.playSwoosh();
    router.push('/(profile)/edit-profile');
  };

  const handleMyBookings = async () => {
    await soundManager.playSwoosh();
    router.push('/(tabs)/bookings');
  };

  const handlePaymentMethods = async () => {
    await soundManager.playSwoosh();
    Alert.alert('Payment Methods', 'Manage your saved cards, UPI, and other payment options here.');
  };

  const handleNotifications = async () => {
    await soundManager.playSwoosh();
    Alert.alert('Notifications', 'Customize your notification preferences for bookings, offers, and updates.');
  };

  const handleHelpSupport = async () => {
    await soundManager.playSwoosh();
    Alert.alert(
      'Help & Support',
      'Need assistance? Contact us:\n\n📞 24/7 Helpline: 1800-MAID-HELP\n📧 Email: support@maideasy.com\n💬 Live Chat: Available in app'
    );
  };

  const handlePrivacySecurity = async () => {
    await soundManager.playSwoosh();
    Alert.alert('Privacy & Security', 'Manage your privacy settings, data preferences, and account security here.');
  };

  const handleSettings = async () => {
    await soundManager.playSwoosh();
    Alert.alert('App Settings', 'Configure app preferences, language, and other general settings.');
  };

  const handleReferFriend = async () => {
    await soundManager.playSwoosh();
    Alert.alert(
      'Refer a Friend',
      'Share MaidEasy with your friends and family!\n\n🎁 You earn ₹100 credit\n🎁 Your friend gets ₹50 off their first booking\n\nStart referring now!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share App', onPress: () => console.log('Sharing app...') }
      ]
    );
  };

  const handleBookingHistory = async () => {
    await soundManager.playSwoosh();
    Alert.alert('Booking History', 'View all your past bookings, ratings, and service history here.');
  };

  const toggleNotifications = async () => {
    await soundManager.playSwoosh();
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      'Notifications',
      `Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'} successfully!`
    );
  };

  const toggleDarkMode = async () => {
    await soundManager.playSwoosh();
    setDarkModeEnabled(!darkModeEnabled);
    Alert.alert(
      'Dark Mode',
      `Dark mode ${!darkModeEnabled ? 'enabled' : 'disabled'} successfully!`
    );
  };

  const getUserInitials = () => {
    if (!user?.name || typeof user.name !== 'string') {
      return 'U';
    }
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  };

  const getFirstName = () => {
    if (!user?.name || typeof user.name !== 'string') {
      return 'User';
    }
    return user.name.split(' ')[0] || 'User';
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: Edit3,
      onPress: handleEditProfile,
      showArrow: true,
    },
    {
      id: 'bookings',
      title: 'My Bookings',
      subtitle: `${stats.totalBookings} total bookings`,
      icon: Heart,
      onPress: handleMyBookings,
      showArrow: true,
    },
    {
      id: 'booking-history',
      title: 'Booking History',
      subtitle: 'View all past services',
      icon: History,
      onPress: handleBookingHistory,
      showArrow: true,
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      icon: CreditCard,
      onPress: handlePaymentMethods,
      showArrow: true,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: Bell,
      onPress: handleNotifications,
      rightComponent: (
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '40' }}
          thumbColor={notificationsEnabled ? COLORS.primary : COLORS.white}
        />
      ),
    },
    {
      id: 'dark-mode',
      title: 'Dark Mode',
      subtitle: 'Toggle app theme',
      icon: Moon,
      onPress: toggleDarkMode,
      rightComponent: (
        <Switch
          value={darkModeEnabled}
          onValueChange={toggleDarkMode}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '40' }}
          thumbColor={darkModeEnabled ? COLORS.primary : COLORS.white}
        />
      ),
    },
    {
      id: 'refer',
      title: 'Refer a Friend',
      subtitle: 'Earn ₹100 for each referral',
      icon: Gift,
      onPress: handleReferFriend,
      showArrow: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: '24/7 customer support',
      icon: HelpCircle,
      onPress: handleHelpSupport,
      showArrow: true,
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: Shield,
      onPress: handlePrivacySecurity,
      showArrow: true,
    },
    {
      id: 'settings',
      title: 'App Settings',
      subtitle: 'General app preferences',
      icon: Settings,
      onPress: handleSettings,
      showArrow: true,
    },
  ];

  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {getUserInitials()}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
                <Edit3 size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.name || 'User Name'}
              </Text>
              <Text style={styles.userGreeting}>
                Welcome back, {getFirstName()}! 👋
              </Text>

              <View style={styles.userDetails}>
                {user?.email && (
                  <View style={styles.detailRow}>
                    <Mail size={16} color={COLORS.white} />
                    <Text style={styles.detailText}>{user.email}</Text>
                  </View>
                )}

                {user?.phone && (
                  <View style={styles.detailRow}>
                    <Phone size={16} color={COLORS.white} />
                    <Text style={styles.detailText}>{user.phone}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Star size={16} color="#FFD700" />
                  <Text style={styles.detailText}>
                    {stats.averageRating.toFixed(1)} rating • {stats.completedServices} services
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Heart size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </Card>

          <Card style={styles.statCard}>
            <Star size={24} color="#FFD700" />
            <Text style={styles.statNumber}>{stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </Card>

          <Card style={styles.statCard}>
            <CreditCard size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>{formatIndianCurrency(stats.totalSpent)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem} onPress={handleMyBookings}>
              <Heart size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={handleReferFriend}>
              <Share2 size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Refer Friend</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={handleHelpSupport}>
              <HelpCircle size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Get Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <item.icon size={20} color={COLORS.primary} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              {item.rightComponent || (item.showArrow && (
                <ChevronRight size={16} color={COLORS.textSecondary} />
              ))}
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.error} size="small" />
            ) : (
              <LogOut size={20} color={COLORS.error} />
            )}
            <Text style={styles.signOutText}>
              {loading ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MaidEasy v1.0.0</Text>
          <Text style={styles.versionText}>Made with ❤️ in India</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarInitials: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...FONTS.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userGreeting: {
    ...FONTS.body2,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 12,
  },
  userDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    ...FONTS.body3,
    color: COLORS.white,
    opacity: 0.8,
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    ...SHADOWS.small,
  },
  statNumber: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: RADIUS.m,
    ...SHADOWS.small,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  signOutContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    ...SHADOWS.small,
  },
  signOutText: {
    ...FONTS.body2,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 40,
    gap: 4,
  },
  versionText: {
    ...FONTS.body3,
    color: COLORS.textTertiary,
  },
});
