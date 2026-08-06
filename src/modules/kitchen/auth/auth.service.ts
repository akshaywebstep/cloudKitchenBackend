// src/modules/kitchen/auth/auth.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, UserType } from '../../../../prisma/generated/prisma/client';
import userRepo from '../../shared/user/user.repository';
import debugHelper from '../../../core/helpers/debug';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// For login (optional fields)
interface AuthDataLogin {
    username: string;
    password: string;
}

/**
 * Login Service for Kitchens
 */
export const loginKitchen = async (data: AuthDataLogin) => {
    try {
        const { username, password } = data;

        debugHelper.debug(`[Auth Service] Searching for kitchen: ${username}`);

        const response = await userRepo.findFirst({
            where: {
                userType: {
                    in: [UserType.KITCHEN, UserType.KITCHEN_STAFF]
                },
                OR: [
                    { phone: username },
                    { email: username },
                ]
            },
            select: {
                id: true,
                kitchenName: true,
                password: true,
                phone: true,
                email: true,
                contactTitle: true,
                contactFirstName: true,
                contactLastName: true,
                contactEmail: true,
                contactPhone: true,
                status: true,
                role: true,
                userType: true,
                isOnboardingCompleted: true
            }
        });

        if (!response?.status || !response?.data) {
            debugHelper.debugError(`[Auth Service] Kitchen not found: ${username}`);
            throw new Error('Invalid username or password');
        }

        const user = response.data;

        if (user.status !== 'ACTIVE') {
            debugHelper.debugError(`[Auth Service] Inactive kitchen: ${username}`);
            return {
                status: false,
                message: `Kitchen is ${user.status}`
            };
        }

        if (user.userType === UserType.KITCHEN_STAFF) {
            if (!user.parent || user.parent.userType !== UserType.KITCHEN) {
                debugHelper.debugError('[Auth Service] Invalid parent for subuser');
                throw new Error('Invalid username or password');
            }

            if (user.parent.status !== 'ACTIVE') {
                throw new Error('Parent kitchen is not active');
            }
        }

        debugHelper.debug('[Auth Service] Verifying password with Bcrypt...');
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            debugHelper.debugError('[Auth Service] Password mismatch.');
            throw new Error('Invalid username or password');
        }

        debugHelper.debug('[Auth Service] Password verified.');

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        debugHelper.debug('[Auth Service] Token generated successfully.');

        return { status: true, message: 'Login successful', data: { kitchen: userWithoutPassword, token } };

    } catch (error: any) {
        // 🔥 Important: never expose internal error
        debugHelper.debugError(`[Auth Service] Login failed: ${error.message}`);

        throw new Error(
            error.message === 'Invalid username or password'
                ? error.message
                : 'Something went wrong while logging in'
        );
    }
};

/**
 * Fetch user by username/email/phone for authentication purposes
 */
export const getUserByUsername = async (
    username: string,
    type: "username" | "email" | "phone"
) => {
    try {
        if (!username || !type) {
            return {
                status: false,
                message: "Username and type are required",
                data: null
            };
        }

        debugHelper.debug(`[Auth Service] Fetching user by ${type}: ${username}`);

        // 🔹 dynamic where condition
        const whereCondition =
            type === "username"
                ? { username }
                : type === "email"
                    ? { email: username }
                    : { phone: username };

        const response = await userRepo.findFirst({
            where: whereCondition,
            select: {
                id: true,
                email: true,
                phone: true,
                password: true,
                status: true,
                userType: true,
                role: true
            }
        });

        if (!response?.status || !response?.data) {
            return {
                status: false,
                message: "User not found",
                data: null
            };
        }

        return {
            status: true,
            message: "User fetched successfully",
            data: response.data
        };

    } catch (error: any) {
        debugHelper.debugError(`[Auth Service] getUserByUsername failed: ${error.message}`);

        return {
            status: false,
            message: "Something went wrong",
            data: null
        };
    }
};

/**
 * Check if username/email/phone already exists
 */
export const checkUserAvailability = async (identifier: string) => {
    try {
        if (!identifier) {
            return {
                available: false,
                message: "Invalid value",
                field: null
            };
        }

        const response = await userRepo.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                ],
            },
            select: {
                email: true,
                phone: true,
            }
        });

        const user = response?.data;

        if (user) {
            let field: "username" | "email" | "phone" | null = null;

            if (user.username === identifier) field = "username";
            else if (user.email === identifier) field = "email";
            else if (user.phone === identifier) field = "phone";

            return {
                available: false,
                field,
                message: field ? `${field} already exists` : "Value already exists"
            };
        }

        return {
            available: true,
            field: null,
            message: "Available"
        };

    } catch (error: any) {
        return {
            available: false,
            field: null,
            message: error.message || "Error checking availability"
        };
    }
};

export const getUserByResetToken = async (token: string) => {
    try {
        if (!token) {
            return {
                status: false,
                message: "Token is required",
                data: null
            };
        }

        debugHelper.debug(`[Auth Service] Fetching user by reset token`);

        // 🔹 hash incoming token (must match DB stored hash)
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const response = await userRepo.findFirst({
            where: {
                resetPasswordToken: hashedToken
            },
            select: {
                id: true,
                password: true,
                resetPasswordExpiresAt: true,
                status: true,
                userType: true
            }
        });

        if (!response?.status || !response?.data) {
            return {
                status: false,
                message: "Invalid token",
                data: null
            };
        }

        const user = response.data;

        // 🔹 expiry check
        if (
            !user.resetPasswordExpiresAt ||
            user.resetPasswordExpiresAt < new Date()
        ) {
            return {
                status: false,
                message: "Token expired",
                data: null
            };
        }

        return {
            status: true,
            message: "User fetched successfully",
            data: user
        };

    } catch (error: any) {
        debugHelper.debugError(`[Auth Service] getUserByResetToken failed: ${error.message}`);

        return {
            status: false,
            message: "Something went wrong",
            data: null
        };
    }
};

/**
 * Create Kitchen Service using Kitchen Repository
 * Accepts a single JSON object for user data
 */
export const createKitchen = async (data: {
    profilePicture: string;
    kitchenName: string;
    phone: string;
    email: string;
    password: string;
    contactTitle: string;
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
    contactPhone: string;
}) => {
    const { profilePicture, kitchenName, phone, email, password, contactTitle, contactFirstName, contactLastName, contactEmail, contactPhone } = data;

    debugHelper.debug(`[Kitchen Service] Checking if user exists: ${email} or ${phone}`);

    const existingUsers = await userRepo.findMany({
        where: {
            OR: [
                { phone },
                { email },
            ],
        },
    });

    if (existingUsers.data && existingUsers.data.length > 0) {
        const usedFields = new Set<string>([
            ...existingUsers.data
                .map((user: User) => user.phone === phone ? 'Phone' : null)
                .filter(Boolean) as string[],
            ...existingUsers.data
                .map((user: User) => user.email === email ? 'Email' : null)
                .filter(Boolean) as string[],
        ]);

        const errorMessage = usedFields.size > 1
            ? `${[...usedFields].join(', ')} already exist`
            : `${[...usedFields][0]} already exists`;

        debugHelper.debugError(`[Kitchen Service] Creation failed: ${errorMessage}`);
        return { status: false, message: errorMessage };
    }

    debugHelper.debug('[Kitchen Service] Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    debugHelper.debug('[Kitchen Service] Saving new kitchen to database...');
    const createResponse = await userRepo.create({
        profilePicture,
        kitchenName,
        phone,
        email,
        contactTitle,
        contactFirstName,
        contactLastName,
        contactEmail,
        contactPhone,
        password: hashedPassword,
        userType: UserType.KITCHEN
    });

    if (!createResponse.status) {
        return { status: false, message: createResponse.message || 'Failed to create kitchen' };
    }

    debugHelper.debug(`[Kitchen Service] Kitchen created: ID ${createResponse.data.id}`);
    const { password: _, ...userWithoutPassword } = createResponse.data;
    return { status: true, data: userWithoutPassword, message: 'Kitchen created successfully' };
};
