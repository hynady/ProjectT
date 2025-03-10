import { BaseService } from "@/commons/base.service.ts";
import { 
  UserInfo, 
  UpdateProfileRequest, 
  UpdateProfileResponse, 
  DeleteAccountRequest, 
  DeleteAccountResponse, 
  UserProfileCard, 
  CreateProfileCardRequest, 
  UpdateProfileCardRequest,
  ProfileCardResponse
} from "../internal-types/settings.types.ts";
import { settingsMockData } from "./settings.mock.ts";
import { format } from 'date-fns';


class SettingsService extends BaseService {
  private static instance: SettingsService;

  private constructor() {
    super();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  async getUserInfo(): Promise<UserInfo> {
    return this.request({
      method: 'GET',
      url: 'user',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(settingsMockData.userInfo), 500);
      })
    });
  }

  async updateInfo(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    // Tạo bản sao dữ liệu để xử lý
    const processedData = { ...data };
    
    // Lưu trữ ngày dưới dạng chuỗi cho API request
    let birthdayString: string | null = null;
    
    // Sử dụng date-fns để định dạng ngày
    if (processedData.birthday instanceof Date) {
      birthdayString = format(processedData.birthday, 'yyyy-MM-dd');
      // Giữ nguyên birthday như Date object cho processedData
    }
    
    return this.request({
      method: 'PUT',
      url: 'user',
      data: { 
        ...processedData,
        birthday: birthdayString  // Gửi dạng chuỗi đến API
      },
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          // Đối với mock data, chuyển đổi ngược lại thành Date nếu cần
          const birthdayDate = birthdayString ? new Date(birthdayString) : processedData.birthday;
          
          // Update the mock data with the new values, including Cloudinary avatar URL
          const updatedProfile: UserInfo = { 
            ...settingsMockData.userInfo, 
            ...processedData,
            birthday: birthdayDate,  // Sử dụng Date cho UserInfo
          };
          
          // Update the mock data for future requests
          settingsMockData.userInfo = { ...updatedProfile };
          
          resolve({
            success: true,
            message: "Cập nhật thông tin thành công",
            data: updatedProfile
          });
        }, 800);
      })
    });
  }

  async deleteAccount(request: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    return this.request({
      method: 'DELETE',
      url: 'user/account',
      data: request,
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate validation
          if (request.password !== "password123") {
            reject(new Error("Mật khẩu không chính xác"));
            return;
          }
          
          resolve({
            success: true,
            message: "Tài khoản đã được xóa thành công"
          });
        }, 800);
      })
    });
  }

  async getProfileCards(): Promise<UserProfileCard[]> {
    return this.request({
      method: 'GET',
      url: 'user/profiles',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(settingsMockData.profileCards), 500);
      })
    });
  }

  async createProfileCard(data: CreateProfileCardRequest): Promise<ProfileCardResponse> {
    return this.request({
      method: 'POST',
      url: 'user/profiles',
      data,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const newProfileCard = {
            id: `profile_${Math.random().toString(36).substr(2, 9)}`,
            ...data,
            isDefault: settingsMockData.profileCards.length === 0
          };
          
          // Add to mock data for future requests
          settingsMockData.profileCards.push(newProfileCard);
          
          resolve({
            success: true,
            message: "Tạo thẻ thông tin thành công",
            data: newProfileCard
          });
        }, 800);
      })
    });
  }

  async updateProfileCard(data: UpdateProfileCardRequest): Promise<ProfileCardResponse> {
    return this.request({
      method: 'PUT',
      url: `user/profiles/${data.id}`,
      data,
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          const profileIndex = settingsMockData.profileCards.findIndex(p => p.id === data.id);
          if (profileIndex === -1) {
            reject(new Error("Không tìm thấy thẻ thông tin"));
            return;
          }
          
          // If we're setting this as default, unset others
          if (data.isDefault) {
            settingsMockData.profileCards.forEach(p => {
              p.isDefault = false;
            });
          }
          
          const updatedProfile = {
            ...settingsMockData.profileCards[profileIndex],
            ...data
          };
          
          settingsMockData.profileCards[profileIndex] = updatedProfile;
          
          resolve({
            success: true,
            message: "Cập nhật thẻ thông tin thành công",
            data: updatedProfile
          });
        }, 800);
      })
    });
  }

  async deleteProfileCard(id: string): Promise<{success: boolean; message: string}> {
    return this.request({
      method: 'DELETE',
      url: `user/profiles/${id}`,
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          const profileIndex = settingsMockData.profileCards.findIndex(p => p.id === id);
          if (profileIndex === -1) {
            reject(new Error("Không tìm thấy thẻ thông tin"));
            return;
          }
          
          // Check if we're deleting default profile
          const isDefault = settingsMockData.profileCards[profileIndex].isDefault;
          
          // Remove profile
          settingsMockData.profileCards.splice(profileIndex, 1);
          
          // If removed profile was default and we still have profiles, set first as default
          if (isDefault && settingsMockData.profileCards.length > 0) {
            settingsMockData.profileCards[0].isDefault = true;
          }
          
          resolve({
            success: true,
            message: "Xóa thẻ thông tin thành công"
          });
        }, 800);
      })
    });
  }
}

export const settingsService = SettingsService.getInstance();
