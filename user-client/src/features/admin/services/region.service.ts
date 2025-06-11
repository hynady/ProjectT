import { BaseService } from "@/commons/base.service";

export interface Region {
  id: string;
  regionName: string;
  regionImage?: string;
  count: number;
}

export interface RegionResponse {
  id: string;
  regionName: string;
  regionImage?: string;
  count: number;
}

export interface RegionIdName {
  id: string;
  name: string;
}

export interface CreateRegionRequest {
  name: string;
  image?: string;
}

export interface UpdateRegionRequest {
  name: string;
  image?: string;
}

class RegionService extends BaseService {
  // Get all regions with event count
  async getRegions(): Promise<RegionResponse[]> {
    return this.request<RegionResponse[]>({
      method: "GET",
      url: "/regions",
      mockResponse: async () => [
        {
          id: "1",
          regionName: "Hà Nội",
          regionImage: "/api/placeholder/50/50",
          count: 25,
        },
        {
          id: "2",
          regionName: "Hồ Chí Minh",
          regionImage: "/api/placeholder/50/50",
          count: 30,
        },
        {
          id: "3",
          regionName: "Đà Nẵng",
          regionImage: "/api/placeholder/50/50",
          count: 15,
        },
      ],
      defaultValue: [],
    });
  }

  // Get regions (only id and name)
  async getRegionNames(): Promise<RegionIdName[]> {
    return this.request<RegionIdName[]>({
      method: "GET",
      url: "/regions/getOnlyNameRegion",
      mockResponse: async () => [
        { id: "1", name: "Hà Nội" },
        { id: "2", name: "Hồ Chí Minh" },
        { id: "3", name: "Đà Nẵng" },
      ],
      defaultValue: [],
    });
  }
  // Get region by ID
  async getRegionById(id: string): Promise<Region> {
    return this.request<Region>({
      method: "GET",
      url: `/regions/${id}`,
      mockResponse: async () => ({
        id,
        regionName: "Mock Region",
        regionImage: "/api/placeholder/50/50",
        count: 0,
      }),
    });
  }
  // Create new region
  async createRegion(data: CreateRegionRequest): Promise<Region> {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.image) {
      formData.append("image", data.image);
    }

    return this.request<Region>({
      method: "POST",
      url: "/regions",
      data: formData,
      mockResponse: async () => ({
        id: Date.now().toString(),
        regionName: data.name,
        regionImage: data.image || "/api/placeholder/50/50",
        count: 0,
      }),
    });
  }
  // Update region
  async updateRegion(id: string, data: UpdateRegionRequest): Promise<Region> {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.image) {
      formData.append("image", data.image);
    }

    return this.request<Region>({
      method: "PUT",
      url: `/regions/${id}`,
      data: formData,
      mockResponse: async () => ({
        id,
        regionName: data.name,
        regionImage: data.image || "/api/placeholder/50/50",
        count: 0,
      }),
    });
  }
  // Delete region
  async deleteRegion(id: string): Promise<void> {
    return this.request<void>({
      method: "DELETE",
      url: `/regions/${id}`,
      mockResponse: async () => {},
    });
  }
}

export const regionService = new RegionService();
