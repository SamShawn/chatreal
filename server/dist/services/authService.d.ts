import type { SafeUser, CreateUserInput, LoginInput, AuthResponse } from '../types/index.js';
/**
 * Hash password using bcrypt
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Verify password
 */
export declare const verifyPassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Generate JWT access token
 */
export declare const generateAccessToken: (user: SafeUser) => string;
/**
 * Generate refresh token
 */
export declare const generateRefreshToken: (user: SafeUser) => string;
/**
 * Verify refresh token
 */
export declare const verifyRefreshToken: (token: string) => {
    userId: string;
} | null;
/**
 * Convert user to safe user (without password)
 */
export declare const toSafeUser: (user: {
    id: string;
    email: string;
    username: string;
    avatar: string | null;
    status: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}) => SafeUser;
/**
 * Register a new user
 */
export declare const registerUser: (input: CreateUserInput) => Promise<AuthResponse>;
/**
 * Login user
 */
export declare const loginUser: (input: LoginInput) => Promise<AuthResponse>;
/**
 * Logout user
 */
export declare const logoutUser: (userId: string) => Promise<void>;
/**
 * Refresh access token
 */
export declare const refreshAccessToken: (refreshToken: string) => Promise<AuthResponse>;
/**
 * Get user by ID
 */
export declare const getUserById: (id: string) => Promise<SafeUser | null>;
/**
 * Update user profile
 */
export declare const updateUser: (userId: string, data: {
    username?: string;
    avatar?: string;
}) => Promise<SafeUser>;
/**
 * Update user status
 */
export declare const updateUserStatus: (userId: string, status: "ONLINE" | "AWAY" | "DND" | "OFFLINE") => Promise<void>;
/**
 * Get all users
 */
export declare const getUsers: () => Promise<SafeUser[]>;
/**
 * Ban user
 */
export declare const banUser: (userId: string, bannedBy: string, reason?: string) => Promise<void>;
/**
 * Unban user
 */
export declare const unbanUser: (userId: string) => Promise<void>;
//# sourceMappingURL=authService.d.ts.map