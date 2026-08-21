import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userRepo from '../../shared/user/user.repository';
import { UserType } from '../../../../prisma/generated/prisma/client';
import debugHelper from '../../../core/helpers/debug';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Updated interface to hold the full user object from the DB
export interface AuthRequest extends Request {
    kitchen?: {
        id: number | bigint;
        kitchenName: string;
        role: UserType;
        parentId: number | bigint | null;
        createdAt: Date | string;
        updatedAt: Date | string;
    };
}

interface VerifyOptions {
    checkOnboarding?: boolean;
    checkSubscription?: boolean;
}

export const verifyToken = (options: VerifyOptions = {}) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        debugHelper.debug('--- [Auth Middleware] Incoming Request Verification ---');

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            debugHelper.debugWarn('[Auth Middleware] Verification Failed: No Bearer token');
            return res.status(401).json({
                status: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            // 1. Verify JWT Signature
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
            debugHelper.debug(`[Auth Middleware] JWT Verified for User ID: ${decoded.userId}`);

            // 2. Fetch fresh user details from Repository
            debugHelper.debug(`[Auth Middleware] Fetching user details from Repo for ID: ${decoded.userId}...`);
            const response = await userRepo.findFirst({
                where: {
                    id: BigInt(decoded.userId),
                    userType: {
                        in: [UserType.KITCHEN, UserType.KITCHEN_STAFF]
                    },
                },
                select: {
                    id: true,
                    kitchenName: true,
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
                    isOnboardingCompleted: true,
                    subscriptions: {
                        where: {
                            status: 'ACTIVE'
                        },
                        select: {
                            status: true,
                            trialEndDate: true,
                            planEndDate: true
                        }
                    }
                }
            });

            // 3. Validate if user exists in DB
            if (!response.status || !response.data) {
                debugHelper.debugError(`[Auth Service] Kitchen not found`);
                return res.status(404).json({
                    status: false,
                    message: "User account no longer exists."
                });
            }

            const user = response.data;

            // =========================
            // BASIC CHECKS (ALWAYS)
            // =========================
            if (user.status !== 'ACTIVE') {
                debugHelper.debugError(`[Auth Service] Inactive kitchen: ${user.kitchenName}`);
                return {
                    status: false,
                    message: `Kitchen is ${user.status}`
                };
            }

            // 🔹 Parent
            if (user.userType === UserType.KITCHEN_STAFF) {
                if (!user.parent || user.parent.userType !== UserType.KITCHEN) {
                    debugHelper.debugError('[Auth Service] Invalid parent for staff');
                    throw new Error('Invalid username or password');
                }

                if (user.parent.status !== 'ACTIVE') {
                    throw new Error('Parent kitchen is not active');
                }

                // if trial and plan end date both gone then mark that subscription expired
                if (
                    user.subscriptions &&
                    user.subscriptions.length > 0 &&
                    user.subscriptions[0].trialEndDate &&
                    user.subscriptions[0].planEndDate &&
                    user.subscriptions[0].trialEndDate < new Date() &&
                    user.subscriptions[0].planEndDate < new Date()
                ) {
                    user.isSubscriptionActive = false;
                }

            }

            // =========================
            // OPTIONAL CHECKS
            // =========================

            // 🔹 Onboarding
            if (options.checkOnboarding) {
                if (
                    user.userType === UserType.KITCHEN &&
                    !user.isOnboardingCompleted
                ) {
                    return res.status(403).json({
                        status: false,
                        message: 'Onboarding not completed'
                    });
                }
            }

            user.isSubscriptionActive = true;

            debugHelper.debug(`[Auth Middleware] User: ${JSON.stringify(user, null, 2)}`);

            // 🔹 Subscription
            if (user.subscriptions && user.subscriptions.length > 0) {

                let isSubscriptionActive = false;

                const sub = user.subscriptions[0];

                const now = new Date();
                // =========================
                // CASE 1: PLAN EXISTS
                // =========================
                if (sub.planEndDate) {
                    if (new Date(sub.planEndDate) > now) {
                        isSubscriptionActive = true;
                    }
                }
                // =========================
                // CASE 2: ONLY TRIAL
                // =========================
                else if (sub.trialEndDate) {
                    if (new Date(sub.trialEndDate) > now) {
                        isSubscriptionActive = true;
                    }
                }

                user.isSubscriptionActive = isSubscriptionActive;
            } else {
                if (options.checkSubscription) {
                    throw new Error('No active subscription found');
                }
            }

            const subscription = user.subscriptions[0];

            debugHelper.debug(`[Auth Middleware] Subscription: ${JSON.stringify(subscription, null, 2)}`);

            if (subscription && subscription.status !== 'ACTIVE') {
                user.isSubscriptionActive = false;

                debugHelper.debugError('[Auth Service] No active subscription found');
                if (options.checkSubscription) {
                    throw new Error('No active subscription found');
                }
            }

            // =========================
            // ATTACH USER
            // =========================
            const { password, subscriptions, ...userSafeData } = user;
            debugHelper.debug(`[Auth Middleware] User details: ${JSON.stringify(userSafeData, null, 2)}`);
            req.kitchen = userSafeData;

            debugHelper.debug(`[Auth Middleware] ✅ Success: Kitchen '${req.kitchen?.kitchenName}' verified.`);
            debugHelper.debug('--- [Auth Middleware] Passing to Next Handler ---');

            next();
        } catch (error: any) {
            debugHelper.debugError(`[Auth Middleware] ❌ Failed: ${error.message}`);
            return res.status(403).json({
                status: false,
                message: error.message || "Invalid or expired token."
            });
        }
    }
};
