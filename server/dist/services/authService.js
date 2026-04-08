import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
const prisma = new PrismaClient();
/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password) => {
    return bcrypt.hash(password, 12);
};
/**
 * Verify password
 */
export const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
/**
 * Generate JWT access token
 */
export const generateAccessToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
};
/**
 * Generate refresh token
 */
export const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user.id, type: 'refresh' }, config.jwtSecret, { expiresIn: config.refreshTokenExpiry });
};
/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        if (decoded.type !== 'refresh')
            return null;
        return { userId: decoded.userId };
    }
    catch {
        return null;
    }
};
/**
 * Convert user to safe user (without password)
 */
export const toSafeUser = (user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
/**
 * Register a new user
 */
export const registerUser = async (input) => {
    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existingEmail) {
        throw new Error('Email already registered');
    }
    // Check if username exists
    const existingUsername = await prisma.user.findUnique({
        where: { username: input.username },
    });
    if (existingUsername) {
        throw new Error('Username already taken');
    }
    // Hash password
    const passwordHash = await hashPassword(input.password);
    // Create user
    const user = await prisma.user.create({
        data: {
            email: input.email,
            username: input.username,
            passwordHash,
        },
    });
    const safeUser = toSafeUser(user);
    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);
    // Store refresh token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken,
            refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });
    return { user: safeUser, accessToken, refreshToken };
};
/**
 * Login user
 */
export const loginUser = async (input) => {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    // Check if banned
    if (user.bannedAt) {
        throw new Error(`Account banned: ${user.banReason || 'No reason provided'}`);
    }
    // Verify password
    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }
    const safeUser = toSafeUser(user);
    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);
    // Update refresh token and status
    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken,
            refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'ONLINE',
        },
    });
    return { user: safeUser, accessToken, refreshToken };
};
/**
 * Logout user
 */
export const logoutUser = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            refreshToken: null,
            refreshTokenExpiry: null,
            status: 'OFFLINE',
        },
    });
};
/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
        throw new Error('Invalid refresh token');
    }
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Verify stored refresh token matches
    if (user.refreshToken !== refreshToken) {
        throw new Error('Refresh token reused');
    }
    // Check expiry
    if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
        throw new Error('Refresh token expired');
    }
    const safeUser = toSafeUser(user);
    const newAccessToken = generateAccessToken(safeUser);
    const newRefreshToken = generateRefreshToken(safeUser);
    // Update tokens
    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: newRefreshToken,
            refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    return { user: safeUser, accessToken: newAccessToken, refreshToken: newRefreshToken };
};
/**
 * Get user by ID
 */
export const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user)
        return null;
    return toSafeUser(user);
};
/**
 * Update user profile
 */
export const updateUser = async (userId, data) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data,
    });
    return toSafeUser(user);
};
/**
 * Update user status
 */
export const updateUserStatus = async (userId, status) => {
    await prisma.user.update({
        where: { id: userId },
        data: { status },
    });
};
/**
 * Get all users
 */
export const getUsers = async () => {
    const users = await prisma.user.findMany({
        orderBy: { username: 'asc' },
    });
    return users.map(toSafeUser);
};
/**
 * Ban user
 */
export const banUser = async (userId, bannedBy, reason) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            bannedAt: new Date(),
            bannedBy,
            banReason: reason,
            status: 'OFFLINE',
            refreshToken: null,
        },
    });
};
/**
 * Unban user
 */
export const unbanUser = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            bannedAt: null,
            bannedBy: null,
            banReason: null,
        },
    });
};
//# sourceMappingURL=authService.js.map