export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  role: 'customer' | 'provider' | 'admin';
  address?: string;
  city?: string;
  pincode?: string;
  createdAt: string;
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
}

export interface BookingFormData {
  serviceId: string;
  maidId?: string;
  date: Date;
  time: string;
  address: string;
  city?: string;
  pincode?: string;
  notes?: string;
  recurring: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly';
}
