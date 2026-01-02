export const JWT_CONSTANTS = {
    ACCESS_EXPIRES_IN: 'JWT_ACCESS_EXPIRES_IN',
    REFRESH_EXPIRES_IN: 'JWT_REFRESH_EXPIRES_IN',
} as const;

export const ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
} as const;

export interface AuthenticatedRequest extends Request {
    user: { userId: number }; // точно соответствует тому, что возвращает JwtStrategy.validate()
}