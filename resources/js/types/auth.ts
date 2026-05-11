export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
    avatar_url?: string | null;
    avatar_path?: string | null;
    email_verified_at: string | null;
    preferred_locale: string;
    timezone?: string;
    role: 'admin' | 'user' | string;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
