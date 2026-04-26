export interface AuthUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  phone?: string | null;
  profilePictureUrl?: string | null;
  banned?: boolean | null;
  role?: string | null;
  banReason?: string | null;
  banExpires?: string | null;
  dateOfBirth?: string | null;
}

export interface WithAuthUser {
  authUser: AuthUser;
}
