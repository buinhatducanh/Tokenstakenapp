export type RequestMagicLinkInput = {
    email: string;
};

export type VerifyMagicLinkInput = {
    token: string;
};

export type LogoutInput = {
    token: string;
};

export type AuthResponse = {
    token: string;
    user: {
        id: string;
        email: string;
        displayName?: string | null;
    };
};

export type SessionUser = {
    id: string;
    email: string;
    displayName?: string | null;
};