export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt?: string;
  user?: User;
}

export interface RefreshTokenResponse {
  token?: string;
  accessToken?: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  image: string;
  userName: string;
  phoneNumber: string;
}

export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  label?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  dob?: string;
  address?: string;
  nid?: string;
  image?: string;
  existingImage?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  genderId?: number;
  genderName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
