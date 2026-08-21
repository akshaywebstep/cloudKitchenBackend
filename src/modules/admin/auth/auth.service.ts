// src/modules/admin/auth/auth.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { UserType } from '../../../../prisma/generated/prisma/client';
import userRepo from '../../shared/user/user.repository';
import debugHelper from '../../../core/helpers/debug';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

interface AuthDataLogin {
    username: string; // email or phone
    password: string;
}

/**
 * Login Service for Admin
 */
export const loginAdmin = async (data: AuthDataLogin) => {
    try {
        const { username, password } = data;

        debugHelper.debug(`[Admin Auth Service] Searching for admin: ${username}`);

        const response = await userRepo.findFirst({
          where: {
            userType: { in: [UserType.ADMIN, UserType.ADMIN_STAFF] },
            OR: [{ phone: username }, { email: username }],
          },
          select: {
            id: true,
            email: true,
            phone: true,
            password: true,
            status: true,
            role: true,
            userType: true,
          },
        });

        if (!response?.status || !response?.data) {
            debugHelper.debugError(`[Admin Auth Service] Admin not found: ${username}`);
            throw new Error('Invalid username or password');
        }

        const admin = response.data;

        if (admin.status !== 'ACTIVE') {
            debugHelper.debugError(`[Admin Auth Service] Inactive admin: ${username}`);
            return {
                status: false,
                message: `Admin account is ${admin.status}`
            };
        }

        debugHelper.debug('[Admin Auth Service] Verifying password with Bcrypt...');
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            debugHelper.debugError('[Admin Auth Service] Password mismatch.');
            throw new Error('Invalid username or password');
        }

        debugHelper.debug('[Admin Auth Service] Password verified.');

        const token = jwt.sign(
            { userId: admin.id, role: admin.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: _, ...adminWithoutPassword } = admin;

        debugHelper.debug('[Admin Auth Service] Token generated successfully.');

        return {
            status: true,
            message: 'Login successful',
            data: { admin: adminWithoutPassword, token }
        };

    } catch (error: any) {
        debugHelper.debugError(`[Admin Auth Service] Login failed: ${error.message}`);

        throw new Error(
            error.message === 'Invalid username or password'
                ? error.message
                : 'Something went wrong while logging in'
        );
    }
};

/**
 * Fetch admin by email/phone for forgot-password purposes
 */
export const getUserByUsername = async (
    username: string,
    type: "email" | "phone"
) => {
    try {
        if (!username || !type) {
            return {
                status: false,
                message: "Username and type are required",
                data: null
            };
        }

        debugHelper.debug(`[Admin Auth Service] Fetching admin by ${type}: ${username}`);

        const whereCondition =
            type === "email"
                ? { email: username }
                : { phone: username };

        const response = await userRepo.findFirst({
          where: {
            ...whereCondition,
            userType: { in: [UserType.ADMIN, UserType.ADMIN_STAFF] }, // 👈 CHANGED
          },
          select: {
            id: true,
            email: true,
            phone: true,
            password: true,
            status: true,
            userType: true,
            role: true,
          },
        });

        if (!response?.status || !response?.data) {
            return {
                status: false,
                message: "Admin not found",
                data: null
            };
        }

        return {
            status: true,
            message: "Admin fetched successfully",
            data: response.data
        };

    } catch (error: any) {
        debugHelper.debugError(`[Admin Auth Service] getUserByUsername failed: ${error.message}`);

        return {
            status: false,
            message: "Something went wrong",
            data: null
        };
    }
};

/**
 * Fetch admin by reset token (for reset-password step)
 */
export const getUserByResetToken = async (token: string) => {
    try {
        if (!token) {
            return {
                status: false,
                message: "Token is required",
                data: null
            };
        }

        debugHelper.debug(`[Admin Auth Service] Fetching admin by reset token`);

        // 🔹 hash incoming token (must match DB stored hash)
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const response = await userRepo.findFirst({
          where: {
            resetPasswordToken: hashedToken,
            userType: { in: [UserType.ADMIN, UserType.ADMIN_STAFF] }, // 👈 CHANGED
          },
          select: {
            id: true,
            password: true,
            resetPasswordExpiresAt: true,
            status: true,
            userType: true,
          },
        });

        if (!response?.status || !response?.data) {
            return {
                status: false,
                message: "Invalid token",
                data: null
            };
        }

        const admin = response.data;

        // 🔹 expiry check
        if (
            !admin.resetPasswordExpiresAt ||
            admin.resetPasswordExpiresAt < new Date()
        ) {
            return {
                status: false,
                message: "Token expired",
                data: null
            };
        }

        return {
            status: true,
            message: "Admin fetched successfully",
            data: admin
        };

    } catch (error: any) {
        debugHelper.debugError(`[Admin Auth Service] getUserByResetToken failed: ${error.message}`);

        return {
            status: false,
            message: "Something went wrong",
            data: null
        };
    }
};