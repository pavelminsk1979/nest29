export type CreateUser = {
  login: string;
  passwordHash: string;
  email: string;
  createdAt: string;
  confirmationCode: string;
  isConfirmed: boolean;
  expirationDate: string;
  isBanned: boolean;
  banReason: string;
  banDate: string;
};

export type CreateUserWithId = {
  id: string;
  login: string;
  passwordHash: string;
  email: string;
  createdAt: string;
  confirmationCode: string;
  isConfirmed: boolean;
  expirationDate: string;
  isBanned: boolean;
  banReason: string;
  banDate: string;
};
