import { supabase } from './supabase';

export interface Maid {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  skills: string[];
  verified: boolean;
  hourly_rate: number;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  duration: number;
  is_active: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  maid_id?: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  address: string;
  city?: string;
  pincode?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_price: number;
  notes?: string;
  created_at: string;
  services?: Service;
  maids?: Maid;
}

// Test Supabase connection
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    console.log('Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
};

// Fetch all active maids
export const getMaids = async (): Promise<Maid[]> => {
  try {
    console.log('Fetching maids from Supabase...');
    const { data, error } = await supabase
      .from('maids')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching maids:', error);
      throw error;
    }

    console.log('Maids fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getMaids:', error);
    throw error;
  }
};

// Fetch top rated maids
export const getTopRatedMaids = async (limit: number = 5): Promise<Maid[]> => {
  try {
    console.log(`Fetching top ${limit} rated maids...`);
    const { data, error } = await supabase
      .from('maids')
      .select('*')
      .eq('is_active', true)
      .eq('verified', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top rated maids:', error);
      throw error;
    }

    console.log('Top rated maids fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getTopRatedMaids:', error);
    throw error;
  }
};

// Fetch maids by city


// Fetch all active services
export const getServices = async (): Promise<Service[]> => {
  try {
    console.log('Fetching services from Supabase...');
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      throw error;
    }

    console.log('Services fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getServices:', error);
    throw error;
  }
};

// Search maids by skills
export const searchMaidsBySkills = async (skills: string[]): Promise<Maid[]> => {
  try {
    console.log('Searching maids by skills:', skills);
    const { data, error } = await supabase
      .from('maids')
      .select('*')
      .eq('is_active', true)
      .overlaps('skills', skills)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error searching maids by skills:', error);
      throw error;
    }

    console.log('Maids found by skills:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in searchMaidsBySkills:', error);
    throw error;
  }
};


// Fetch user bookings
export const getUserBookings = async (userId: string): Promise<any[]> => {
  try {
    console.log(`Fetching bookings for user: ${userId}`);

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services:service_id(*),
        maids:maid_id(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }

    console.log('User bookings fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    throw error;
  }
};
export const getUserBookingsByStatus = async (
  userId: string,
  statuses: string[]
): Promise<any[]> => {
  try {
    console.log(`Fetching bookings for user: ${userId} with statuses:`, statuses);

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services:service_id(*),
        maids:maid_id(*)
      `)
      .eq('user_id', userId)
      .in('status', statuses)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user bookings by status:', error);
      throw error;
    }

    console.log('User bookings by status fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getUserBookingsByStatus:', error);
    throw error;
  }
};


// Create a new booking
// Add this function to your existing supabase-helpers.ts file

export const createBooking = async (bookingData: any): Promise<any> => {
  try {
    console.log('Creating booking with data:', bookingData);
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: bookingData.user_id,
        service_id: bookingData.service_id,
        maid_id: bookingData.maid_id,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        duration: bookingData.duration,
        address: bookingData.address,
        notes: bookingData.notes || '',
        total_price: bookingData.total_price,
        status: bookingData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    console.log('Booking created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createBooking:', error);
    throw error;
  }
};


// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: Booking['status']
): Promise<Booking> => {
  try {
    console.log(`Updating booking ${bookingId} status to: ${status}`);
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }

    console.log('Booking status updated:', data);
    return data;
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    console.log('User profile fetched:', data);
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    console.log(`Updating profile for user: ${userId}`, updates);
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    console.log('User profile updated:', data);
    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }

};
// Add this function to fetch maids by city
export const getMaidsByCity = async (city: string): Promise<Maid[]> => {
  try {
    console.log(`Fetching maids in city: ${city}`);
    const { data, error } = await supabase
      .from('maids')
      .select('*')
      .eq('is_active', true)
      .ilike('city', `%${city}%`)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching maids by city:', error);
      throw error;
    }

    console.log(`Maids in ${city} fetched:`, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getMaidsByCity:', error);
    throw error;
  }
};

// Add this function to search maids by location radius
export const getMaidsByLocation = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Maid[]> => {
  try {
    // For now, we'll use city-based filtering since we don't have lat/lng in maids table
    // In a real app, you'd calculate distance using lat/lng
    const { data, error } = await supabase
      .from('maids')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching maids by location:', error);
      throw error;
    }

    // For demo, return all maids (in real app, filter by distance)
    return data || [];
  } catch (error) {
    console.error('Error in getMaidsByLocation:', error);
    throw error;
  }
};
