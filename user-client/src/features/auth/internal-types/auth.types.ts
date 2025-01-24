export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface OtpResponse {
  message: string;
}

export interface ServiceError {
  status: number;
  message: string;
}