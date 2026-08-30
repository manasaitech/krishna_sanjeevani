export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  category: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: string;        // userId
  role: string;       // user role
  email: string;      // user email
  authProvider?: string; // identity provider e.g. 'google', 'email'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerified: number;
  authProvider: string;
  createdAt: number;
}
