export type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
};

export type AuthResponse = {
  status: string;
  user: AuthUser;
  accessToken: string;
};
