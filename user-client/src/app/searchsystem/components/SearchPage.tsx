import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Button} from "@/components/ui/button";
import {
  SheetCustomOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet-custom-overlay.tsx";
import {Badge} from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui-custom/pagination-custom";
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {EventData} from '@/types';
import {EventCard} from "@/app/homepage/components/EventCard";
import {categories as mockCategories, mockEvents, venues as mockVenues} from "@/services/mockData";
import {Filter, X} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";

// Define the search params schema
const searchFormSchema = z.object({
  categoryId: z.enum(['all', ...mockCategories.map(c => c.id)]),
  venueId: z.enum(['all', ...mockVenues.map(v => v.id)]),
  sortBy: z.enum(['date', 'price', 'title']),
  sortOrder: z.enum(['asc', 'desc']),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFormValues>({
    categoryId: 'all',
    venueId: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 8,
  });

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: filters
  });

  // Initialize filters from URL params
  useEffect(() => {
    const categoryId = (searchParams.get('categoryId') as SearchFormValues['categoryId']) || 'all';
    const venueId = (searchParams.get('venueId') as SearchFormValues['venueId']) || 'all';
    const sortBy = (searchParams.get('sortBy') as SearchFormValues['sortBy']) || 'date';
    const sortOrder = (searchParams.get('sortOrder') as SearchFormValues['sortOrder']) || 'desc';

    const initialFilters = {
      categoryId,
      venueId,
      sortBy,
      sortOrder
    };

    setFilters(initialFilters);
    form.reset(initialFilters);
  }, [searchParams, form]);

  const getCategoryName = (id: string) =>
    id === 'all' ? 'Tất cả' : mockCategories.find(c => c.id === id)?.name || '';

  const getVenueName = (id: string) =>
    id === 'all' ? 'Tất cả' : mockVenues.find(v => v.id === id)?.name || '';

  const fetchEvents = async (page: number, formValues: SearchFormValues) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredEvents = [...mockEvents];

      const keyword = searchParams.get('keyword');
      if (keyword) {
        filteredEvents = filteredEvents.filter(event =>
          event.title.toLowerCase().includes(keyword.toLowerCase()) ||
          event.location.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      if (formValues.categoryId && formValues.categoryId !== 'all') {
        filteredEvents = filteredEvents.filter(event =>
          event.categoryId === formValues.categoryId
        );
      }

      if (formValues.venueId && formValues.venueId !== 'all') {
        filteredEvents = filteredEvents.filter(event =>
          event.venueId === formValues.venueId
        );
      }

      filteredEvents.sort((a, b) => {
        let comparison = 0;
        switch (formValues.sortBy) {
          case 'date':
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case 'price':
            comparison = parseInt(a.price.replace(/\D/g, '')) -
              parseInt(b.price.replace(/\D/g, ''));
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
        }
        return formValues.sortOrder === 'desc' ? -comparison : comparison;
      });

      const size = pagination.size;
      const start = page * size;
      const paginatedEvents = filteredEvents.slice(start, start + size);

      setEvents(paginatedEvents);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(filteredEvents.length / size),
        totalElements: filteredEvents.length,
      }));

    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(0, filters);
  }, [filters, searchParams]);

  type FilterValue = SearchFormValues[keyof SearchFormValues];

  const handleFilterChange = (
    type: keyof SearchFormValues,
    value: FilterValue,
    sortOrder?: 'asc' | 'desc'
  ) => {
    let newFilters = {...filters};

    if (type === 'sortBy' && sortOrder) {
      newFilters = {
        ...newFilters,
        sortBy: value as SearchFormValues['sortBy'],
        sortOrder
      };
    } else {
      (newFilters[type] as FilterValue) = value;
    }

    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === 'all') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    setSearchParams(params);

    setFilters(newFilters);
    form.reset(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchEvents(page, filters);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({length: 1}).map((_, index) => (
        <EventCard key={index} loading={true} event={{} as EventData}/>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8 max-w-screen-xl px-4">
      {/* Filter Header */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Top row: Applied filters and filter button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {pagination.totalElements} kết quả
            </Badge>

            {filters.categoryId !== 'all' && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive transition-colors flex items-center gap-1"
                onClick={() => handleFilterChange('categoryId', 'all')}
              >
                {getCategoryName(filters.categoryId)}
                <X className="h-3 w-3"/>
              </Badge>
            )}

            {filters.venueId !== 'all' && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive/10 transition-colors flex items-center gap-1"
                onClick={() => handleFilterChange('venueId', 'all')}
              >
                {getVenueName(filters.venueId)}
                <X className="h-3 w-3"/>
              </Badge>
            )}
          </div>

          <SheetCustomOverlay open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-4 w-4"/>
                Bộ lọc
                {(filters.categoryId !== 'all' || filters.venueId !== 'all') && (
                  <Badge variant="secondary" className="ml-1">
                    {(filters.categoryId !== 'all' ? 1 : 0) +
                      (filters.venueId !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[90vw] sm:w-[400px] p-0"
              onInteractOutside={() => setIsFilterOpen(false)}
            >
              <div className="flex flex-col h-full">
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 py-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Danh mục</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={filters.categoryId === 'all' ? 'default' : 'outline'}
                            onClick={() => handleFilterChange('categoryId', 'all')}
                            className="h-auto py-2 px-4"
                          >
                            Tất cả
                          </Button>
                          {mockCategories.map(category => (
                            <Button
                              key={category.id}
                              type="button"
                              variant={filters.categoryId === category.id ? 'default' : 'outline'}
                              onClick={() => handleFilterChange('categoryId', category.id)}
                              className="h-auto py-2 px-4"
                            >
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Địa điểm</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={filters.venueId === 'all' ? 'default' : 'outline'}
                            onClick={() => handleFilterChange('venueId', 'all')}
                            className="h-auto py-2 px-4"
                          >
                            Tất cả
                          </Button>
                          {mockVenues.map(venue => (
                            <Button
                              key={venue.id}
                              type="button"
                              variant={filters.venueId === venue.id ? 'default' : 'outline'}
                              onClick={() => handleFilterChange('venueId', venue.id)}
                              className="h-auto py-2 px-4"
                            >
                              {venue.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </SheetCustomOverlay>
        </div>
        {/* Bottom row: Sort buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Sắp xếp theo:
        </span>
          <div className="flex gap-2">
            {[
              {type: 'date', label: 'Ngày'},
              {type: 'price', label: 'Giá'},
              {type: 'title', label: 'Tên'}
            ].map(({type, label}) => (
              <div key={type} className="flex items-center">
                <Button
                  variant={filters.sortBy === type ? "default" : "outline"}
                  size="sm"
                  className="rounded-r-none border-r-0"
                  onClick={() => handleFilterChange(
                    'sortBy',
                    type as SearchFormValues['sortBy'],
                    filters.sortBy === type && filters.sortOrder === 'desc' ? 'asc' : 'desc'
                  )}
                >
                  {label}
                </Button>
                <Button
                  variant={filters.sortBy === type ? "default" : "outline"}
                  size="sm"
                  className="rounded-l-none px-2"
                  onClick={() => handleFilterChange(
                    'sortBy',
                    type as SearchFormValues['sortBy'],
                    filters.sortOrder === 'asc' ? 'desc' : 'asc'
                  )}
                >
                  {filters.sortBy === type ? (
                    filters.sortOrder === 'asc' ? '↑' : '↓'
                  ) : '↓'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Results Grid */}
      {loading ? (
        <LoadingSkeleton/>
      ) : events.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} loading={false}/>
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center text-gray-500">
          Không tìm thấy sự kiện nào phù hợp
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
              />
            </PaginationItem>
            {[...Array(pagination.totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index)}
                  isActive={pagination.currentPage === index}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages - 1}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};