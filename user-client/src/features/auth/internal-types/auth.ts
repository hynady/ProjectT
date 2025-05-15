export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface OtpResponse {
  message: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface OtpState {
  isLoading: boolean;
  cooldown: number;
  isDisabled: boolean;
}

export interface RegisterResponse {
  message: string;
}

export interface ResetPasswordPayload {
  email: string;
  password: string;
}
