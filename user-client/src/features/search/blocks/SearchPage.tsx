import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/commons/components/button.tsx";
import { SheetCustomOverlay, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/commons/components/sheet-custom-overlay.tsx";
import { Badge } from "@/commons/components/badge.tsx";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/commons/components/pagination-custom.tsx";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { OccaCard } from "@/features/home/components/OccaCard.tsx";
import { Filter, X } from "lucide-react";
import { ScrollArea } from "@/commons/components/scroll-area.tsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/commons/components/accordion.tsx';
import { searchService } from "@/features/search/services/search.service.ts";
import {OccaCardUnit} from "@/features/home/internal-types/home.ts";

export type SearchFormValues = {
  categoryId: string;
  venueId: string;
  sortBy: 'date' | 'price' | 'title';
  sortOrder: 'asc' | 'desc';
};

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<OccaCardUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [venues, setVenues] = useState<{ id: string, name: string }[]>([]);
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

  const fetchCategoriesAndVenues = async () => {
    try {
      const [categoriesData, venuesData] = await Promise.all([
        searchService.fetchCategories(),
        searchService.fetchVenues()
      ]);
      setCategories(categoriesData);
      setVenues(venuesData);
    } catch (error) {
      console.error('Error fetching categories and venues:', error);
    }
  };

  useEffect(() => {
    fetchCategoriesAndVenues();
  }, []);

  const searchFormSchema = z.object({
    categoryId: z.enum(['all', ...categories.map(c => c.id)]),
    venueId: z.enum(['all', ...venues.map(v => v.id)]),
    sortBy: z.enum(['date', 'price', 'title']),
    sortOrder: z.enum(['asc', 'desc']),
  });

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: filters
  });

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
    id === 'all' ? 'Tất cả' : categories.find(c => c.id === id)?.name || '';

  const getVenueName = (id: string) =>
    id === 'all' ? 'Tất cả' : venues.find(v => v.id === id)?.name || '';

  const fetchEventsData = async (page: number, formValues: SearchFormValues) => {
    setLoading(true);
    try {
      const { events, totalPages, totalElements } = await searchService.fetchEvents(page, formValues, searchParams, pagination.size);
      setEvents(events);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages,
        totalElements,
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData(0, filters);
  }, [filters, searchParams]);

  type FilterValue = SearchFormValues[keyof SearchFormValues];

  const handleFilterChange = (
    type: keyof SearchFormValues,
    value: FilterValue,
    sortOrder?: 'asc' | 'desc'
  ) => {
    let newFilters = { ...filters };

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
    fetchEventsData(page, filters);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 1 }).map((_, index) => (
        <OccaCard key={index} loading={true} occa={{} as OccaCardUnit} />
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
                <X className="h-3 w-3" />
              </Badge>
            )}

            {filters.venueId !== 'all' && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive/10 transition-colors flex items-center gap-1"
                onClick={() => handleFilterChange('venueId', 'all')}
              >
                {getVenueName(filters.venueId)}
                <X className="h-3 w-3" />
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
                <Filter className="h-4 w-4" />
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
                    <Accordion type="single" collapsible className="w-full">
                      {/* Categories Accordion Item */}
                      <AccordionItem value="categories">
                        <AccordionTrigger className="font-medium">
                          Danh mục
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button
                              type="button"
                              variant={filters.categoryId === 'all' ? 'default' : 'outline'}
                              onClick={() => handleFilterChange('categoryId', 'all')}
                              className="h-auto py-2 px-4"
                            >
                              Tất cả
                            </Button>
                            {categories.map(category => (
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
                        </AccordionContent>
                      </AccordionItem>

                      {/* Venues Accordion Item */}
                      <AccordionItem value="venues">
                        <AccordionTrigger className="font-medium">
                          Địa điểm
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button
                              type="button"
                              variant={filters.venueId === 'all' ? 'default' : 'outline'}
                              onClick={() => handleFilterChange('venueId', 'all')}
                              className="h-auto py-2 px-4"
                            >
                              Tất cả
                            </Button>
                            {venues.map(venue => (
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
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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
              { type: 'date', label: 'Ngày' },
              { type: 'price', label: 'Giá' },
              { type: 'title', label: 'Tên' }
            ].map(({ type, label }) => (
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
        <LoadingSkeleton />
      ) : events.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <OccaCard key={event.id} occa={event} loading={false} />
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
                className="cursor-pointer"
              />
            </PaginationItem>
            {[...Array(pagination.totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index)}
                  isActive={pagination.currentPage === index}
                  className="cursor-pointer"
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages - 1}
                className="cursor-pointer"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};