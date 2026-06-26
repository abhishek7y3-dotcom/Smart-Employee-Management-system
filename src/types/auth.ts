export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  profilePicture?: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: TokenResponse;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}
