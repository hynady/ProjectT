import { useState, useEffect } from 'react';
import { TicketDisplayUnit } from '../internal-types/ticket.type';
import { isTicketCheckedIn, isTicketExpired } from '@/commons/lib/utils/ticketUtils';
import { ticketService } from '@/features/my-ticket/services/ticket.service';

export const useTickets = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTickets, setActiveTickets] = useState<TicketDisplayUnit[]>([]);
  const [usedTickets, setUsedTickets] = useState<TicketDisplayUnit[]>([]);
  const [hasLoadedUsedTickets, setHasLoadedUsedTickets] = useState(false);
  const currentDate = new Date('2025-01-21 07:02:17');

  const fetchActiveTickets = async () => {
    try {
      setLoading(true);
      const tickets = await ticketService.getActiveTickets();
      const active = tickets.filter(ticket => 
        !isTicketCheckedIn(ticket) && !isTicketExpired(ticket, currentDate)
      );
      setActiveTickets(active);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsedTickets = async () => {
    if (hasLoadedUsedTickets) return;
    try {
      setLoading(true);
      const tickets = await ticketService.getUsedTickets();
      const used = tickets.filter(ticket =>
        isTicketCheckedIn(ticket) || isTicketExpired(ticket, currentDate)
      );
      setUsedTickets(used);
      setHasLoadedUsedTickets(true);
    } catch (err) {
      setError('Failed to fetch used tickets');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchActiveTickets();
  }, []);

  return {
    activeTickets,
    usedTickets,
    loading,
    error,
    hasLoadedUsedTickets,
    loadUsedTickets: fetchUsedTickets
  };
};