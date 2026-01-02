export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
} as const;

export const COOKIE_OPTIONS_BASE = {
    httpOnly: true,
    path: '/',
} as const;