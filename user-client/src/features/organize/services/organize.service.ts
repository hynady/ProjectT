import { BaseService } from '@/commons/base.service';
import { 
  OrganizerOccaUnit, 
  CreateOccaPayload, 
  CreateOccaResponse 
} from '../internal-types/organize.type';
import { organizeMockData } from './organize.mock';

class OrganizeService extends BaseService {
  private static instance: OrganizeService;

  private constructor() {
    super();
  }

  public static getInstance(): OrganizeService {
    if (!OrganizeService.instance) {
      OrganizeService.instance = new OrganizeService();
    }
    return OrganizeService.instance;
  }

  async getOccasByType(type: string, organizerId: string): Promise<OrganizerOccaUnit[]> {
    return this.request({
      method: 'GET',
      url: `/organize/${type}?organizerId=${organizerId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve(organizeMockData[type as keyof typeof organizeMockData] || []);
        }, 800);
      })
    });
  }

  async createOcca(data: CreateOccaPayload): Promise<CreateOccaResponse> {
    return this.request({
      method: 'POST',
      url: '/organize/occa',
      data,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const newId = `new-${Date.now()}`;
          resolve({
            id: newId,
            title: data.basicInfo.title,
            status: data.status
          });
        }, 1500);
      })
    });
  }

  async getOccaById(id: string): Promise<any> {
    return this.request({
      method: 'GET',
      url: `/organize/occa/${id}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          // Find in mock data by id
          for (const type in organizeMockData) {
            const found = organizeMockData[type as keyof typeof organizeMockData].find(
              (occa) => occa.id === id
            );
            if (found) {
              resolve(found);
              return;
            }
          }
          resolve(null);
        }, 800);
      })
    });
  }
}

export const organizeService = OrganizeService.getInstance();
