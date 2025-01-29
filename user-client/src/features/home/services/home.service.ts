import { BaseService } from "@/commons/base.service.ts";
import { HeroSectionUnit, CategorySectionUnit, FeatureOccasSectionUnit, UpcomingOccasSectionUnit, VenueCardUnit } from "@/features/home/internal-types/home.ts";
import { homeMockData } from "@/features/home/services/home.mock.ts";

class HomeService extends BaseService {
  private static instance: HomeService;

  private constructor() {
    super();
  }

  public static getInstance(): HomeService {
    if (!HomeService.instance) {
      HomeService.instance = new HomeService();
    }
    return HomeService.instance;
  }

  async getHeroOccas(): Promise<HeroSectionUnit[]> {
    return this.request({
      method: 'GET',
      url: '/hero-occas',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(homeMockData.heroOccas), 1000);
      })
    });
  }

  async getFeaturedOccas(): Promise<FeatureOccasSectionUnit[]> {
    return this.request({
      method: 'GET',
      url: '/featured-occas',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(homeMockData.featuredOccas), 1000);
      })
    });
  }

  async getUpcomingOccas(): Promise<UpcomingOccasSectionUnit[]> {
    return this.request({
      method: 'GET',
      url: '/upcoming-occas',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(homeMockData.upcomingOccas), 1000);
      })
    });
  }

  async getCategories(): Promise<CategorySectionUnit[]> {
    return this.request({
      method: 'GET',
      url: '/categories',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(homeMockData.categories), 1000);
      })
    });
  }

  async getVenues(): Promise<VenueCardUnit[]> {
    return this.request({
      method: 'GET',
      url: '/venues',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(homeMockData.venues), 1000);
      })
    });
  }
}

export const homeService = HomeService.getInstance();