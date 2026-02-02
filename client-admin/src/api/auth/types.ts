export interface AdminLoginDto {
    login: string;
    password: string;
    ip?: string;
  }
  
  export interface AdminTokenResponse {
    accessToken: string;
    refreshToken: string;
    accountId: string;
    login: string;
  }
  
  export interface AdminRefreshTokenDto {
    refreshToken: string;
  } 
  
  export interface AdminLoginResponse {
    accountId: string;
    login: string;
    message: string;
  }
  
  export interface AdminRefreshResponse {
    accountId: string;
    login: string;
    message: string;
  }