export interface AuthUser {
  name: string;
  id: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  imageKey: string | null;
  phone: string | null;
  profilePictureUrl: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WithAuthUser {
  authUser: AuthUser;
}

export interface AuthMember {
  id: string;
  role: string;
  createdAt: string;
  userId: string;
  organizationId: string;
}
