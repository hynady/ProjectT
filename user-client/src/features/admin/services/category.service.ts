import { BaseService } from "@/commons/base.service";

export interface Category {
  id: string;
  name: string;
  eventCount?: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  count: number;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

class CategoryService extends BaseService {
  // Get all categories with event count
  async getCategories(): Promise<CategoryResponse[]> {
    return this.request<CategoryResponse[]>({
      method: "GET",
      url: "/categories",      mockResponse: async () => [
        {
          id: "1",
          name: "Âm nhạc",
          count: 12,
        },
        {
          id: "2",
          name: "Thể thao",
          count: 8,
        },
        {
          id: "3",
          name: "Nghệ thuật",
          count: 5,
        },
      ],
      defaultValue: [],
    });
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    return this.request<Category>({
      method: "GET",
      url: `/categories/${id}`,
      mockResponse: async () => ({
        id,
        name: "Mock Category",
        eventCount: 0,
      }),
    });
  }

  // Create new category
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const formData = new FormData();
    formData.append("name", data.name);

    return this.request<Category>({
      method: "POST",
      url: "/categories",
      data: formData,
      mockResponse: async () => ({
        id: Date.now().toString(),
        name: data.name,
        eventCount: 0,
      }),
    });
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const formData = new FormData();
    formData.append("name", data.name);

    return this.request<Category>({
      method: "PUT",
      url: `/categories/${id}`,
      data: formData,
      mockResponse: async () => ({
        id,
        name: data.name,
        eventCount: 0,
      }),
    });
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    return this.request<void>({
      method: "DELETE",
      url: `/categories/${id}`,
      mockResponse: async () => {},
    });
  }
}

export const categoryService = new CategoryService();
