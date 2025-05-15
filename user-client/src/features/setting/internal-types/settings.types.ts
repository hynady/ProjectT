export interface UserInfo {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  birthday?: Date | string | null;
}

export interface UserProfileCard {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  isDefault: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  birthday?: Date | string | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: UserInfo;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export interface CreateProfileCardRequest {
  name: string;
  phoneNumber: string;
  email: string;
}

export interface UpdateProfileCardRequest {
  id: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  isDefault?: boolean;
}

export interface ProfileCardResponse {
  success: boolean;
  message: string;
  data: UserProfileCard;
}
