import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/commons/components/button.tsx";
import {
  SheetCustomOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/commons/components/sheet-custom-overlay.tsx";
import { Badge } from "@/commons/components/badge.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/commons/components/pagination-custom.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { OccaCard } from "@/features/home/components/OccaCard.tsx";
import {
  ArrowDown,
  ArrowUp,
  Filter,
  MapPinned,
  Ribbon,
  SearchCheck,
  X,
} from "lucide-react";
import { ScrollArea } from "@/commons/components/scroll-area.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/commons/components/accordion.tsx";
import { searchService } from "@/features/search/services/search.service.ts";
import { OccaCardUnit } from "@/features/home/internal-types/home.ts";
import { useTracking } from "@/features/tracking";

export type SearchFormValues = {
  categoryId: string;
  regionId: string;
  sortBy: "date" | "price" | "title";
  sortOrder: "asc" | "desc";
};

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [occas, setOccas] = useState<OccaCardUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState<SearchFormValues>({
    categoryId: "all",
    regionId: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 8,
  });

  const navigate = useNavigate();
  const { trackEventClick } = useTracking();
  const handleCardClick = (occaId: string) => {
    trackEventClick(occaId, "searchPage");
    navigate(`/occas/${occaId}`);
  };

  const fetchCategoriesAndVenues = async () => {
    try {
      const [categoriesData, regionsData] = await Promise.all([
        searchService.fetchCategories(),
        searchService.fetchRegions(),
      ]);
      setCategories(categoriesData);
      setRegions(regionsData);
    } catch {
      // console.error('Error fetching categories and venues:', error);
    }
  };

  useEffect(() => {
    fetchCategoriesAndVenues();
  }, []);

  const searchFormSchema = z.object({
    categoryId: z.enum(["all", ...categories.map((c) => c.id)]),
    venueId: z.enum(["all", ...regions.map((v) => v.id)]),
    sortBy: z.enum(["date", "price", "title"]),
    sortOrder: z.enum(["asc", "desc"]),
  });

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: filters,
  });

  useEffect(() => {
    const categoryId =
      (searchParams.get("categoryId") as SearchFormValues["categoryId"]) ||
      "all";
    const regionId =
      (searchParams.get("regionId") as SearchFormValues["regionId"]) || "all";
    const sortBy =
      (searchParams.get("sortBy") as SearchFormValues["sortBy"]) || "date";
    const sortOrder =
      (searchParams.get("sortOrder") as SearchFormValues["sortOrder"]) ||
      "desc";

    const initialFilters = {
      categoryId,
      regionId,
      sortBy,
      sortOrder,
    };

    setFilters(initialFilters);
    form.reset(initialFilters);
  }, [searchParams, form]);

  const getCategoryName = (id: string) =>
    id === "all" ? "Tất cả" : categories.find((c) => c.id === id)?.name || "";

  const getRegionName = (id: string) =>
    id === "all" ? "Tất cả" : regions.find((v) => v.id === id)?.name || "";

  // Update the fetchOccasData function to store the last count
  const fetchOccasData = async (page: number, formValues: SearchFormValues) => {
    setLoading(true);
    try {
      const { occas, totalPages, totalElements } =
        await searchService.fetchOccas(
          page,
          formValues,
          searchParams,
          pagination.size
        );
      setOccas(occas);
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages,
        totalElements,
      }));
    } catch {
      // console.error('Error fetching occasions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccasData(0, filters);
  }, [filters, searchParams]);

  type FilterValue = SearchFormValues[keyof SearchFormValues];

  const handleFilterChange = (
    type: keyof SearchFormValues,
    value: FilterValue,
    sortOrder?: "asc" | "desc"
  ) => {
    let newFilters = { ...filters };

    if (type === "sortBy" && sortOrder) {
      newFilters = {
        ...newFilters,
        sortBy: value as SearchFormValues["sortBy"],
        sortOrder,
      };
    } else {
      (newFilters[type] as FilterValue) = value;
    }

    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === "all") {
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
    fetchOccasData(page, filters);
  };

  // First, update the LoadingSkeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: loading && occas.length ? occas.length : 4 }).map(
        (_, index) => (
          <OccaCard key={index} loading={true} occa={{} as OccaCardUnit} />
        )
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-8 max-w-screen-xl px-4">
      {/* Filter Header */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Top row: Applied filters and filter button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              variant="secondary"
              className="bg-primary text-primary-foreground hover:scale-105 hover:bg-primary cursor-default transition-transform ease-out "
            >
              {pagination.totalElements} kết quả
            </Badge>

            {filters.categoryId !== "all" && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive hover:text-muted transition-colors flex items-center gap-1"
                onClick={() => handleFilterChange("categoryId", "all")}
              >
                <Ribbon className="h-3 w-3" />
                {getCategoryName(filters.categoryId)}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {searchParams.get("keyword") && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive hover:text-muted transition-colors flex items-center gap-1"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete("keyword");
                  setSearchParams(params);
                }}
              >
                {" "}
                <SearchCheck className="h-3 w-3" />
                <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {searchParams.get("keyword")}
                </span>
                <X className="h-3 w-3" />
              </Badge>
            )}

            {filters.regionId !== "all" && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive/10 transition-colors flex items-center gap-1"
                onClick={() => handleFilterChange("regionId", "all")}
              >
                <MapPinned className="h-3 w-3" />
                {getRegionName(filters.regionId)}{" "}
                {/* Updated function name to getRegionName */}
                <X className="h-3 w-3" />
              </Badge>
            )}
          </div>

          <SheetCustomOverlay
            open={isFilterOpen}
            onOpenChange={setIsFilterOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-4 w-4" />
                Bộ lọc
                {(filters.categoryId !== "all" ||
                  filters.regionId !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    {(filters.categoryId !== "all" ? 1 : 0) +
                      (filters.regionId !== "all" ? 1 : 0)}
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Show selected filters */}
                    {filters.categoryId !== "all" && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive/10 transition-colors flex items-center gap-1"
                        onClick={() => handleFilterChange("categoryId", "all")}
                      >
                        <Ribbon className="h-3 w-3" />
                        {getCategoryName(filters.categoryId)}
                        <X className="h-3 w-3" />
                      </Badge>
                    )}
                    {searchParams.get("keyword") && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive/10 transition-colors flex items-center gap-1"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.delete("keyword");
                          setSearchParams(params);
                        }}
                      >
                        <SearchCheck className="h-3 w-3" />
                        <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {searchParams.get("keyword")}
                        </span>
                        <X className="h-3 w-3" />
                      </Badge>
                    )}
                    {filters.regionId !== "all" && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive/10 transition-colors flex items-center gap-1"
                        onClick={() => handleFilterChange("regionId", "all")}
                      >
                        <MapPinned className="h-3 w-3" />
                        {getRegionName(filters.regionId)}
                        <X className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
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
                              variant={
                                filters.categoryId === "all"
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() =>
                                handleFilterChange("categoryId", "all")
                              }
                              className="h-auto py-2 px-4"
                            >
                              Tất cả
                            </Button>
                            {categories.map((category) => (
                              <Button
                                key={category.id}
                                type="button"
                                variant={
                                  filters.categoryId === category.id
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleFilterChange("categoryId", category.id)
                                }
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
                              variant={
                                filters.regionId === "all"
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() =>
                                handleFilterChange("regionId", "all")
                              }
                              className="h-auto py-2 px-4"
                            >
                              Tất cả
                            </Button>
                            {regions.map((venue) => (
                              <Button
                                key={venue.id}
                                type="button"
                                variant={
                                  filters.regionId === venue.id
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleFilterChange("regionId", venue.id)
                                }
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
              { type: "date", label: "Ngày" },
              { type: "price", label: "Giá" },
              { type: "title", label: "Tên" },
            ].map(({ type, label }) => (
              <div key={type} className="flex items-center">
                <Button
                  variant={filters.sortBy === type ? "default" : "outline"}
                  size="sm"
                  className="rounded-r-none border-r-0"
                  onClick={() =>
                    handleFilterChange(
                      "sortBy",
                      type as SearchFormValues["sortBy"],
                      filters.sortBy === type && filters.sortOrder === "desc"
                        ? "asc"
                        : "desc"
                    )
                  }
                >
                  {label}
                </Button>
                <Button
                  variant={filters.sortBy === type ? "default" : "outline"}
                  size="sm"
                  className="rounded-l-none px-2"
                  onClick={() =>
                    handleFilterChange(
                      "sortBy",
                      type as SearchFormValues["sortBy"],
                      filters.sortOrder === "asc" ? "desc" : "asc"
                    )
                  }
                >
                  {filters.sortBy === type ? (
                    filters.sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowDown className="h-4 w-4 opacity-50" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : occas.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade">
          {occas.map((occa) => (
            <OccaCard
              key={occa.id}
              occa={occa}
              loading={false}
              handleCardClick={() => handleCardClick(occa.id)}
            />
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
