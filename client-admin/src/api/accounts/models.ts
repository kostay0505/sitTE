export interface Account {
  id: string;
  login: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDto {
  login: string;
  password: string;
}

export interface UpdateAccountDto {
  login?: string;
  password?: string;
}

export interface AccountsResponse {
  accounts: Account[];
  total: number;
} 