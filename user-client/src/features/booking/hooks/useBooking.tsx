// hooks/useBooking.ts
import { useState, useCallback } from 'react';
import { BookingState } from '../blocks/Confirmation.tsx';
import { ShowTime, TicketType } from '@/features/booking/internal-types/booking.type.ts';

const useBooking = () => {
  const [bookingState, setBookingState] = useState<BookingState>({
    selectedShow: null,
    selectedTickets: [],
    totalAmount: 0,
  });

  const selectShow = useCallback((show: ShowTime) => {
    setBookingState(prev => ({
      ...prev,
      selectedShow: show,
      selectedTickets: [], // Reset tickets when show changes
      totalAmount: 0,
    }));
  }, []);

  const updateTickets = useCallback((ticketType: TicketType, quantity: number) => {
    setBookingState(prev => {
      const existingTicketIndex = prev.selectedTickets.findIndex(
        t => t.type === ticketType.type
      );

      let newTickets = [...prev.selectedTickets];

      if (quantity === 0) {
        newTickets = newTickets.filter(t => t.type !== ticketType.type);
      } else if (existingTicketIndex >= 0) {
        newTickets[existingTicketIndex] = {
          type: ticketType.type,
          quantity,
          price: ticketType.price,
        };
      } else {
        newTickets.push({
          type: ticketType.type,
          quantity,
          price: ticketType.price,
        });
      }

      const totalAmount = newTickets.reduce(
        (sum, ticket) => sum + ticket.price * ticket.quantity,
        0
      );

      return {
        ...prev,
        selectedTickets: newTickets,
        totalAmount,
      };
    });
  }, []);

  return {
    bookingState,
    selectShow,
    updateTickets,
  };
};

export default useBooking;