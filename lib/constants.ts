export const COLORS = {
  primary: '#fa442a',
  secondary: '#f97316',
  success: '#22c55e',
  error: '#FF5A5F',
  warning: '#f59e0b',
  background: '#f8f9fa',
  card: '#ffffff',
  white: '#ffffff',
  black: '#222222',
  text: '#222222',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#e5e5e5',
  lightGray: '#e5e5e5',
  darkGray: '#666666',
  disabled: '#cccccc',
  primaryLight: '#fa442a20',
};

export const FONTS = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 28, fontWeight: 'bold' as const },
  h3: { fontSize: 24, fontWeight: '600' as const },
  h4: { fontSize: 20, fontWeight: '600' as const },
  body1: { fontSize: 18 },
  body2: { fontSize: 16 },
  body3: { fontSize: 14 },
  caption: { fontSize: 12 },
};

export const RADIUS = {
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Comprehensive Indian service categories
export const SERVICE_CATEGORIES = [
  { 
    id: 'housekeeping', 
    name: 'Housekeeping', 
    icon: '🏠', 
    color: '#4CAF50',
    description: 'Complete house cleaning services',
    services: ['Cleaning', 'Mopping', 'Dusting', 'Sweeping', 'Window Cleaning']
  },
  { 
    id: 'laundry', 
    name: 'Laundry', 
    icon: '👕', 
    color: '#2196F3',
    description: 'Clothes washing and care',
    services: ['Washing', 'Ironing', 'Folding', 'Wardrobe Management']
  },
  { 
    id: 'cooking', 
    name: 'Cooking', 
    icon: '👨‍🍳', 
    color: '#FF9800',
    description: 'Meal preparation services',
    services: ['Breakfast', 'Lunch', 'Dinner', 'Tiffin Packing']
  },
  { 
    id: 'childcare', 
    name: 'Childcare', 
    icon: '👶', 
    color: '#E91E63',
    description: 'Professional childcare',
    services: ['Babysitting', 'Feeding', 'School Pickup']
  },
  { 
    id: 'elderly-care', 
    name: 'Elderly Care', 
    icon: '👴', 
    color: '#9C27B0',
    description: 'Compassionate elderly care',
    services: ['Companionship', 'Medication', 'Walking Assistance']
  },
  { 
    id: 'pet-care', 
    name: 'Pet Care', 
    icon: '🐕', 
    color: '#795548',
    description: 'Pet care services',
    services: ['Feeding', 'Cleaning', 'Dog Walking']
  },
  { 
    id: 'utensils', 
    name: 'Utensils', 
    icon: '🍽️', 
    color: '#607D8B',
    description: 'Kitchen and dishwashing',
    services: ['Dishwashing', 'Kitchen Cleanup']
  },
  { 
    id: 'grocery-help', 
    name: 'Grocery Help', 
    icon: '🛒', 
    color: '#FF5722',
    description: 'Shopping assistance',
    services: ['Market Runs', 'Online Orders']
  },
  { 
    id: 'other', 
    name: 'Other Services', 
    icon: '⭐', 
    color: '#FFC107',
    description: 'Special occasion services',
    services: ['Event Support', 'Festival Cleaning', 'Party Cleanup']
  },
];

// Indian currency formatter
export const formatIndianCurrency = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

// Indian cities
export const INDIAN_CITIES = [
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Bangalore, Karnataka',
  'Hyderabad, Telangana',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Pune, Maharashtra',
  'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh',
];
