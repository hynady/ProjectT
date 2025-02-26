import { useState } from 'react';
import { bookingService } from '../services/booking.service';
import { BookingPayload } from '@/features/booking/internal-types/booking.type';

interface UseBookingPaymentProps {
  bookingData: BookingPayload;
  onSuccess?: (status: string) => void;
  onError?: (error: Error) => void;
}

interface BookingPaymentResult {
  isProcessing: boolean;
  error: Error | null;
  status: string | null;
  processPayment: () => Promise<void>;
}

export const useBookingPayment = ({ 
  bookingData, 
  onSuccess, 
  onError 
}: UseBookingPaymentProps): BookingPaymentResult => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const processPayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call the bookingService to create a booking
      const result = await bookingService.createBooking(bookingData);
      
      if (result.status === 'success') {
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess(result.status);
        }
      }

      return result;
    } catch (err) {
      // Handle errors
      const error = err instanceof Error ? err : new Error('Unknown error occurred during payment');
      setError(error);
      
      // Call the error callback if provided
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    processPayment
  };
};