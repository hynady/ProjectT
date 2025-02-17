import { BaseService } from "@/commons/base.service";
import {GalleryUnit, LocationData, OccaHeroSectionUnit, OccaShowUnit, OverviewData} from "@/features/detail/internal-types/detail.type.ts";
import {detailMockData} from "@/features/detail/services/detail.mock.ts";

class DetailService extends BaseService {
  async getHeroData(occaId: string): Promise<OccaHeroSectionUnit> {
    return this.request({
      method: 'GET',
      url: `/detail/hero/${occaId}`,
      mockResponse: () => new Promise((resolve, reject) => {
        // Simulate 404 for testing
        if (occaId === 'non-existent-id') {
          reject({ response: { status: 404 } });
        }
        setTimeout(() => resolve(detailMockData.heroData), 1000);
      })
    });
  }

  async getShowsData(occaId: string): Promise<OccaShowUnit[]> {
    return this.request({
      method: 'GET',
      url: `/detail/shows/${occaId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(detailMockData.showsData), 1000);
      })
    });
  }

  async getGalleryData(occaId: string): Promise<GalleryUnit[]> {
    return this.request({
      method: 'GET',
      url: `/detail/gallery/${occaId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(detailMockData.galleryData), 1000);
      })
    });
  }

  async getLocationData(occaId: string): Promise<LocationData> {
    return this.request({
      method: 'GET',
      url: `/detail/location/${occaId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(detailMockData.locationData), 1000);
      })
    });
  }

  async getOverviewData(occaId: string): Promise<OverviewData> {
    return this.request({
      method: 'GET',
      url: `/detail/overview/${occaId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(detailMockData.overviewData), 1000);
      })
    });
  }
}

export const detailService = new DetailService();