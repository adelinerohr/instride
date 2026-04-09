export interface Organization {
  createdAt: Date | string;
  updatedAt: Date | string;
  id: string;
  name: string;
  authOrganizationId: string;
  slug: string;
  timezone: string;
  logoUrl: string | null;
  primaryColor: string | null;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  allowPublicJoin: boolean;
  allowSameDayBookings: boolean;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
}

export interface Level {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  description: string | null;
  color: string;
}
