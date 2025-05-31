import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  duration: number;
}

interface Maid {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  skills: string[];
  verified: boolean;
  hourly_rate: number;
  city: string;
}

interface BookingData {
  service: Service | null;
  maid: Maid | null;
  date: string;
  time: string;
  duration: number;
  address: string;
  notes: string;
  totalPrice: number;
}

interface BookingContextType {
  bookingData: BookingData;
  setSelectedService: (service: Service) => void;
  setSelectedMaid: (maid: Maid) => void;
  setBookingDateTime: (date: string, time: string) => void;
  setBookingAddress: (address: string, notes?: string) => void;
  clearBooking: () => void;
  calculateTotal: () => number;
}

const initialBookingData: BookingData = {
  service: null,
  maid: null,
  date: '',
  time: '',
  duration: 0,
  address: '',
  notes: '',
  totalPrice: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);

  const setSelectedService = (service: Service) => {
    console.log('Setting selected service:', service);
    setBookingData(prev => ({
      ...prev,
      service,
      duration: service.duration,
      totalPrice: service.price,
    }));
  };

  const setSelectedMaid = (maid: Maid) => {
    console.log('Setting selected maid:', maid);
    setBookingData(prev => ({
      ...prev,
      maid,
      totalPrice: prev.service ? prev.service.price + (maid.hourly_rate * (prev.duration / 60)) : maid.hourly_rate,
    }));
  };

  const setBookingDateTime = (date: string, time: string) => {
    console.log('Setting booking date/time:', { date, time });
    setBookingData(prev => ({ ...prev, date, time }));
  };

  const setBookingAddress = (address: string, notes: string = '') => {
    console.log('Setting booking address:', { address, notes });
    setBookingData(prev => ({ ...prev, address, notes }));
  };

  const calculateTotal = () => {
    if (!bookingData.service) return 0;
    
    let total = bookingData.service.price;
    if (bookingData.maid) {
      total += bookingData.maid.hourly_rate * (bookingData.duration / 60);
    }
    return total;
  };

  const clearBooking = () => {
    console.log('Clearing booking data');
    setBookingData(initialBookingData);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        setSelectedService,
        setSelectedMaid,
        setBookingDateTime,
        setBookingAddress,
        clearBooking,
        calculateTotal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
