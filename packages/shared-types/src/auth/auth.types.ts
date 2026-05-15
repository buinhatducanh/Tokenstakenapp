// Auth types — shared between frontend and backend

export type OrgRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | "ACCOUNTANT";

export type User = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  createdAt: string;
};

export type OrganizationMember = {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgRole;
  joinedAt: string | null;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: string;
};

// Auth DTOs
export type MagicLinkRequest = {
  email: string;
};

export type MagicLinkVerifyRequest = {
  token: string;
};

export type WebAuthnRegisterOptions = {
  options: PublicKeyCredentialCreationOptions;
};

export type WebAuthnLoginOptions = {
  options: PublicKeyCredentialRequestOptions;
};

export type WebAuthnVerify = {
  credential: PublicKeyCredential;
};

export type AuthResponse = {
  user: User;
  organization: Organization;
  accessToken: string;
};
