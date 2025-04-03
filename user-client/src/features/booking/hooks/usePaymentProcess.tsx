import { useState } from 'react';
import { bookingService } from '../services/booking.service';
import { BookingPayload, PaymentDetails } from '@/features/booking/internal-types/booking.type';
import { useNavigate } from 'react-router-dom';

interface UsePaymentProcessProps {
  bookingData: BookingPayload;
  occaId: string;
  onSuccess?: (paymentDetails: PaymentDetails) => void;
  onError?: (error: Error) => void;
}

interface PaymentProcessResult {
  isProcessing: boolean;
  error: Error | null;
  paymentDetails: PaymentDetails | null;
  startPayment: () => Promise<PaymentDetails>;
}

export const usePaymentProcess = ({ 
  bookingData, 
  occaId,
  onSuccess, 
  onError 
}: UsePaymentProcessProps): PaymentProcessResult => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const navigate = useNavigate();

  const startPayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call the bookingService to lock tickets
      const result = await bookingService.lockTickets(bookingData);
      
      // Store payment details
      setPaymentDetails(result);
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      // Handle errors
      const error = err instanceof Error ? err : new Error('Có lỗi xảy ra trong quá trình đặt vé');
      setError(error);
      
      // Call the error callback if provided
      if (onError) {
        onError(error);
      }
      
      // If tickets are sold out, navigate back to detail page after 3 seconds
      if (error.message.includes('hết') || error.message.includes('đã được đặt')) {
        setTimeout(() => {
          navigate(`/occas/${occaId}`);
        }, 3000);
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    paymentDetails,
    startPayment
  };
};