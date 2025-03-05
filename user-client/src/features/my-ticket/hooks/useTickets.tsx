import { useState, useEffect, useCallback } from 'react';
import { TicketDisplayUnit } from '../internal-types/ticket.type';
import { isTicketCheckedIn, isTicketExpired } from '@/commons/lib/utils/ticketUtils';
import { ticketService } from '@/features/my-ticket/services/ticket.service';
import { useToast } from '@/commons/hooks/use-toast';

export const useTickets = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTickets, setActiveTickets] = useState<TicketDisplayUnit[]>([]);
  const [usedTickets, setUsedTickets] = useState<TicketDisplayUnit[]>([]);
  const [hasLoadedUsedTickets, setHasLoadedUsedTickets] = useState(false);
  const currentDate = new Date();

  const fetchActiveTickets = async () => {
    try {
      setLoading(true);
      const tickets = await ticketService.getActiveTickets();
      
      // Filter active tickets (not checked in and not expired)
      const active = tickets.filter(ticket => 
        !isTicketCheckedIn(ticket) && !isTicketExpired(ticket, currentDate)
      );
      
      setActiveTickets(active);
      setError(null);
    } catch (err) {
      setError('Không thể tải vé. Vui lòng thử lại sau.');
      toast({
        variant: "destructive",
        title: "Lỗi tải vé",
        description: "Không thể tải thông tin vé của bạn. Vui lòng thử lại sau."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsedTickets = async () => {    
    try {
      setLoading(true);
      const tickets = await ticketService.getUsedTickets();
      
      // Filter used tickets (checked in or expired)
      const used = tickets.filter(ticket =>
        isTicketCheckedIn(ticket) || isTicketExpired(ticket, currentDate)
      );
      
      setUsedTickets(used);
      setHasLoadedUsedTickets(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi tải vé đã sử dụng",
        description: "Không thể tải thông tin vé đã sử dụng. Vui lòng thử lại sau."
      });
    } finally {
      setLoading(false); 
    }
  };

  const checkInTicket = useCallback(async (ticketId: string) => {
    try {
      const { success } = await ticketService.checkInTicket(ticketId);
      
      if (success) {
        // Update local state with the checked-in ticket
        setActiveTickets(prev => {
          const updatedTickets = [...prev];
          const ticketIndex = updatedTickets.findIndex(t => t.ticket.id === ticketId);
          
          if (ticketIndex !== -1) {
            // Remove from active tickets
            const checkedInTicket = {...updatedTickets[ticketIndex]};
            checkedInTicket.ticket.checkedInAt = new Date().toISOString();
            updatedTickets.splice(ticketIndex, 1);
            
            // Add to used tickets
            setUsedTickets(prev => [...prev, checkedInTicket]);
          }
          
          return updatedTickets;
        });
        
        toast({
          variant: "success",
          title: "Check-in thành công",
          description: "Bạn đã check-in vé thành công!"
        });
        
        return true;
      } else {
        throw new Error("Check-in failed");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Check-in thất bại",
        description: "Không thể check-in vé. Vui lòng thử lại sau."
      });
      return false;
    }
  }, [toast]);

  const refreshTickets = useCallback(() => {
    fetchActiveTickets();
    if (hasLoadedUsedTickets) {
      fetchUsedTickets();
    }
  }, [hasLoadedUsedTickets]);

  useEffect(() => {
    fetchActiveTickets();
  }, []);

  return {
    activeTickets,
    usedTickets,
    loading,
    error,
    hasLoadedUsedTickets,
    loadUsedTickets: fetchUsedTickets,
    checkInTicket,
    refreshTickets
  };
};