import { BaseService } from "@/commons/base.service";
import { searchMockData } from "@/features/search/services/search.mock.ts";
import {OccaSearchItemBaseUnit} from "@/features/search/internal-types/search.type.ts";
import {OccaCardUnit} from "@/features/home/internal-types/home.ts";
import {SearchFormValues} from "@/features/search/blocks/SearchPage.tsx";

class SearchService extends BaseService {
  async fetchTrendingData(): Promise<OccaSearchItemBaseUnit[]> {
    return this.request({
      method: 'GET',
      url: '/search/trending',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(searchMockData.trendingData), 1000);
      })
    });
  }

  async fetchRecommendedData(): Promise<OccaSearchItemBaseUnit[]> {
    return this.request({
      method: 'GET',
      url: '/search/recommended',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(searchMockData.recommendData), 1000);
      })
    });
  }

  async searchOccas(query: string): Promise<OccaSearchItemBaseUnit[]> {
    return this.request({
      method: 'GET',
      url: `/search?query=${encodeURIComponent(query)}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          if (query.toLowerCase().includes('fest')) {
            resolve([
              {
                id: 'api-1',
                title: `Similar to "${query}" - Occa 1`,
                date: '2025-01-15',
                location: 'Location A',
              },
              {
                id: 'api-2',
                title: `Similar to "${query}" - Occa 2`,
                date: '2025-01-20',
                location: 'Location B',
              }
            ]);
          } else {
            resolve([]);
          }
        }, 500);
      })
    });
  }

  async fetchEvents(page: number, formValues: SearchFormValues, searchParams: URLSearchParams, paginationSize: number): Promise<{
    events: OccaCardUnit[],
    totalPages: number,
    totalElements: number
  }> {
    return this.request({
      method: 'GET',
      url: `/events?page=${page}&size=${paginationSize}&${searchParams.toString()}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          let filteredEvents = [...searchMockData.allEvents];

          const keyword = searchParams.get('keyword');
          if (keyword) {
            filteredEvents = filteredEvents.filter(occa =>
              occa.title.toLowerCase().includes(keyword.toLowerCase()) ||
              occa.location.toLowerCase().includes(keyword.toLowerCase())
            );
          }

          if (formValues.categoryId && formValues.categoryId !== 'all') {
            filteredEvents = filteredEvents.filter(occa =>
              occa.categoryId === formValues.categoryId
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

          const start = page * paginationSize;
          const paginatedEvents = filteredEvents.slice(start, start + paginationSize);

          resolve({
            events: paginatedEvents,
            totalPages: Math.ceil(filteredEvents.length / paginationSize),
            totalElements: filteredEvents.length,
          });
        }, 500);
      })
    });
  }
  async fetchCategories(): Promise<{ id: string, name: string }[]> {
    return this.request({
      method: 'GET',
      url: '/categories',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(searchMockData.categories), 500);
      })
    });
  }
  async fetchVenues(): Promise<{ id: string, name: string }[]> {
    return this.request({
      method: 'GET',
      url: '/venues',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(searchMockData.venues), 500);
      })
    });
  }
}

export const searchService = new SearchService();