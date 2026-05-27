import { useMemo } from "react";
import type { Organization, OrganizationMember, User } from "@packages/shared-types";

export type AuthContextValue = {
  user: User;
  organization: Organization;
  member: OrganizationMember;
  isAuthenticated: boolean;
};

const CURRENT_ORGANIZATION: Organization = {
  id: "org_tokens_taken",
  name: "Tokens_taken Finance",
  slug: "tokens-taken-finance",
  plan: "PROFESSIONAL",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const CURRENT_USER: User = {
  id: "user_jane_doe",
  email: "jane@tokens-taken.test",
  displayName: "Jane Doe",
  avatarUrl: null,
  locale: "en-US",
  timezone: "Asia/Saigon",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastLoginAt: "2026-05-18T02:30:00.000Z",
};

const CURRENT_MEMBER: OrganizationMember = {
  id: "member_jane_doe",
  userId: CURRENT_USER.id,
  organizationId: CURRENT_ORGANIZATION.id,
  role: "ACCOUNTANT",
  joinedAt: "2026-01-01T00:00:00.000Z",
};

export function useAuth(): AuthContextValue {
  return useMemo(
    () => ({
      user: CURRENT_USER,
      organization: CURRENT_ORGANIZATION,
      member: CURRENT_MEMBER,
      isAuthenticated: true,
    }),
    [],
  );
}
