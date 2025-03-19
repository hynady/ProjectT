import { useState, useEffect, useCallback } from 'react';

interface DataTableHookOptions<TFilter> {
  defaultPage?: number;
  defaultPageSize?: number;
  defaultSortField?: string;
  defaultSortDirection?: 'asc' | 'desc';
  defaultStatusFilter?: string;
  defaultSearchQuery?: string;
  defaultFilter?: TFilter;
  fetchData: (params: any) => Promise<{
    content: any[];
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    number: number;
    empty?: boolean;
  }>;
}

export function useDataTable<TData, TFilter = Record<string, unknown>>({
  defaultPage = 0,
  defaultPageSize = 10,
  defaultSortField,
  defaultSortDirection = 'asc',
  defaultStatusFilter = 'all',
  defaultSearchQuery = '',
  defaultFilter = {} as TFilter,
  fetchData
}: DataTableHookOptions<TFilter>) {
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortField, setSortField] = useState<string | undefined>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery);
  const [filter, setFilter] = useState<TFilter>(defaultFilter);
  
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  // Function to load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare params
      const params = {
        page,
        size: pageSize,
        ...(sortField && { sort: sortField }),
        ...(sortField && { direction: sortDirection }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
        ...filter
      };
      
      const response = await fetchData(params);
      
      setData(response.content || []);
      setTotalItems(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
      setIsLast(!!response.last);
      setIsFirst(!!response.first);
      setIsEmpty(response.empty !== undefined ? response.empty : response.content?.length === 0);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortField, sortDirection, statusFilter, searchQuery, filter, fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(0); // Reset to first page when changing page size
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setPage(0); // Reset to first page when changing sort
  }, []);

  // Handle status filter change
  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
    setPage(0); // Reset to first page when changing status filter
  }, []);

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page when changing search query
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: TFilter) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter
    }));
    setPage(0); // Reset to first page when changing filters
  }, []);

  // Refresh data manually
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Reset all filters and pagination
  const resetFilters = useCallback(() => {
    setPage(defaultPage);
    setPageSize(defaultPageSize);
    setSortField(defaultSortField);
    setSortDirection(defaultSortDirection);
    setStatusFilter(defaultStatusFilter);
    setSearchQuery(defaultSearchQuery);
    setFilter(defaultFilter);
  }, [defaultPage, defaultPageSize, defaultSortField, defaultSortDirection, defaultStatusFilter, defaultSearchQuery, defaultFilter]);

  return {
    // Data state
    data,
    loading,
    error,
    totalItems,
    totalPages,
    isLast,
    isFirst,
    isEmpty,
    
    // Pagination state
    page,
    pageSize,
    
    // Sort state
    sortField,
    sortDirection,
    
    // Filter state
    statusFilter,
    searchQuery,
    filter,
    
    // Handlers
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleStatusChange,
    handleSearchChange,
    handleFilterChange,
    
    // Actions
    refreshData,
    resetFilters
  };
}
