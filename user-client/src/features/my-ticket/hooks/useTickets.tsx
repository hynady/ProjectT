import { useState, useEffect, useCallback, useMemo } from 'react';
import { TicketDisplayUnit } from '../internal-types/ticket.type';
import { ticketService, PageResponse, TicketFilter } from '@/features/my-ticket/services/ticket.service';
import { useToast } from '@/commons/hooks/use-toast';
import { useDebounce } from '@/commons/hooks/useDebounce';

export const useTickets = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store all tickets data by filter to avoid re-fetching
  const [allTicketsData, setAllTicketsData] = useState<{
    [K in TicketFilter]: {
      tickets: TicketDisplayUnit[];
      pageInfo: PageResponse<TicketDisplayUnit> | null;
    }
  }>({
    ACTIVE: { tickets: [], pageInfo: null },
    USED: { tickets: [], pageInfo: null },
    ALL: { tickets: [], pageInfo: null }
  });
  
  const [currentFilter, setCurrentFilter] = useState<TicketFilter>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoize filtered tickets based on current filter and search
  const { tickets, pageInfo } = useMemo(() => {
    const currentData = allTicketsData[currentFilter];
    if (!debouncedSearchQuery) {
      return currentData;
    }
    
    // Client-side search if search query exists
    const filteredTickets = currentData.tickets.filter(ticket =>
      ticket.occa.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      ticket.occa.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
    
    return {
      tickets: filteredTickets,
      pageInfo: currentData.pageInfo
    };
  }, [allTicketsData, currentFilter, debouncedSearchQuery]);  const fetchTickets = useCallback(async (
    filter: TicketFilter = currentFilter,
    page: number = 0,
    size: number = 20,
    search?: string,
    append: boolean = false,
    sort: string = 'createdAt',
    direction: 'asc' | 'desc' = 'desc'
  ) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await ticketService.getTickets(filter, page, size, search, sort, direction);
      
      setAllTicketsData(prev => {
        const currentData = prev[filter];
        return {
          ...prev,
          [filter]: {
            tickets: append ? [...currentData.tickets, ...response.content] : response.content,
            pageInfo: response
          }
        };
      });
      
      setError(null);
    } catch {
      setError('Không thể tải vé. Vui lòng thử lại sau.');
      toast({
        variant: "destructive",
        title: "Lỗi tải vé",
        description: "Không thể tải thông tin vé của bạn. Vui lòng thử lại sau."
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentFilter, toast]);
  const changeFilter = useCallback((filter: TicketFilter) => {
    setCurrentFilter(filter);
    // Only fetch if we don't have data for this filter yet
    const hasData = allTicketsData[filter].tickets.length > 0;
    if (!hasData) {
      fetchTickets(filter, 0, 20, debouncedSearchQuery);
    }
  }, [fetchTickets, debouncedSearchQuery, allTicketsData]);

  const searchTickets = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  // Auto-search when debounced query changes
  useEffect(() => {
    // Only re-fetch if we have a search query, otherwise use cached data
    if (debouncedSearchQuery) {
      fetchTickets(currentFilter, 0, 20, debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, fetchTickets, currentFilter]);
  const loadMoreTickets = useCallback(() => {
    if (pageInfo && !pageInfo.last && !loading) {
      fetchTickets(currentFilter, pageInfo.number + 1, 20, debouncedSearchQuery, true);
    }
  }, [pageInfo, loading, fetchTickets, currentFilter, debouncedSearchQuery]);

  const checkInTicket = useCallback(async (ticketId: string) => {
    try {
      const { success } = await ticketService.checkInTicket(ticketId);
      
      if (success) {
        // Refresh the current view after check-in
        await fetchTickets(currentFilter, 0, 20, debouncedSearchQuery);
        
        toast({
          variant: "success",
          title: "Check-in thành công",
          description: "Bạn đã check-in vé thành công!"
        });
        
        return true;
      } else {
        throw new Error("Check-in failed");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Check-in thất bại",
        description: "Không thể check-in vé. Vui lòng thử lại sau."
      });
      return false;
    }
  }, [toast, fetchTickets, currentFilter, debouncedSearchQuery]);
  const refreshTickets = useCallback(() => {
    // Clear all cached data and refetch current filter
    setAllTicketsData({
      ACTIVE: { tickets: [], pageInfo: null },
      USED: { tickets: [], pageInfo: null },
      ALL: { tickets: [], pageInfo: null }
    });
    fetchTickets(currentFilter, 0, 20, debouncedSearchQuery);
  }, [fetchTickets, currentFilter, debouncedSearchQuery]);// Initial load
  useEffect(() => {
    fetchTickets('ACTIVE', 0, 20, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    tickets,
    loading,
    loadingMore,
    error,
    pageInfo,
    currentFilter,
    searchQuery,
    changeFilter,
    searchTickets,
    loadMoreTickets,
    checkInTicket,
    refreshTickets
  };
};