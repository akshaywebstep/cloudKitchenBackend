// src/modules/admin/auth/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userRepo from '../../shared/user/user.repository';
import { UserType } from '../../../../prisma/generated/prisma/client';
import debugHelper from '../../../core/helpers/debug';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export interface AuthRequest extends Request {
    admin?: {
        id: number | bigint;
        email: string | null;
        phone: string | null;
        role: string;
        status: string;
    };
}

export const verifyToken = () => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        debugHelper.debug('--- [Admin Auth Middleware] Incoming Request Verification ---');

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            debugHelper.debugWarn('[Admin Auth Middleware] Verification Failed: No Bearer token');
            return res.status(401).json({
                status: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            // 1. Verify JWT Signature
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
            debugHelper.debug(`[Admin Auth Middleware] JWT Verified for Admin ID: ${decoded.userId}`);

            // 2. Fetch fresh admin details from Repository
            const response = await userRepo.findFirst({
                where: {
                    id: BigInt(decoded.userId),
                    userType: UserType.ADMIN
                },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    status: true,
                    role: true
                }
            });

            // 3. Validate if admin exists in DB
            if (!response.status || !response.data) {
                debugHelper.debugError(`[Admin Auth Middleware] Admin not found`);
                return res.status(404).json({
                    status: false,
                    message: "Admin account no longer exists."
                });
            }

            const admin = response.data;

            // 4. Basic status check
            if (admin.status !== 'ACTIVE') {
                debugHelper.debugError(`[Admin Auth Middleware] Inactive admin: ${admin.email}`);
                return res.status(403).json({
                    status: false,
                    message: `Admin account is ${admin.status}`
                });
            }

            // 5. Attach admin to request
            req.admin = admin;

            debugHelper.debug(`[Admin Auth Middleware] ✅ Success: Admin '${req.admin?.email}' verified.`);
            debugHelper.debug('--- [Admin Auth Middleware] Passing to Next Handler ---');

            next();
        } catch (error: any) {
            debugHelper.debugError(`[Admin Auth Middleware] ❌ Failed: ${error.message}`);
            return res.status(403).json({
                status: false,
                message: error.message || "Invalid or expired token."
            });
        }
    }
};